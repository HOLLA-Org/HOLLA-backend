import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { hashPassword } from '@/helpers';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import aqp from 'api-query-params';
import { generateCode, getInfo } from '@/utils';
import ObjectId from 'mongoose';
import { UserType } from '@/auth/authUser/auth';
import { CreateAuthDto } from '@/auth/authUser/dto/create-auth.dto';
import { ROLES } from '@/constant';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';
import { ResendCodeDto } from '@/auth/authUser/dto/resend-code.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async findById(_id: string) {
    return await this.userModel.findById(_id);
  }

  async findByEmail({ email }: { email: string }) {
    return await this.userModel.findOne({ email });
  }
  async findOneByUsername({ username }: { username: string }) {
    return await this.userModel.findOne({ username });
  }

  async findEmailByUsername(username: string) {
    const foundUser = await this.userModel.findOne({ username }).lean();
    if (!foundUser) throw new BadRequestException('Username not found!');

    return { email: foundUser.email };
  }

  async findOneByLogin(account: string): Promise<UserType | null> {
    return this.userModel
      .findOne({
        $or: [{ username: account }, { email: account }],
      })
      .exec();
  }

  async isUserExist(username: string) {
    const hasUser = await this.userModel.exists({ username });
    if (hasUser) return true;

    return false;
  }

  async isEmailExist(email: string) {
    const hasEmail = await this.userModel.exists({ email });
    if (hasEmail) return true;

    return false;
  }

  async create(createUserDto: CreateUserDto) {
    const { username, email, password } = createUserDto;

    // Check username has exist?
    const isUserExist = await this.isUserExist(username);
    if (isUserExist) {
      throw new BadRequestException(
        'Username already exists. Please use another username',
      );
    }
    // Check email has exist?
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException(
        `Email ${email} already exists. Please use another email`,
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    const newUser = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
      role: this.configService.get<string>('ROLE_USER'),
    });

    return { _id: newUser._id };
  }

  async findAll(query: string, curent: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if (filter.current || filter.current === 0) delete filter.current;
    if (filter.pageSize || filter.pageSize === 0) delete filter.pageSize;

    if (!curent || curent < 1) curent = 1;
    if (!pageSize || pageSize < 1) pageSize = 1;

    const totalItems = (await this.userModel.find(filter).lean()).length;
    const totalPage = Math.ceil(totalItems / pageSize);
    const skip = (curent - 1) * pageSize;

    const results = await this.userModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .select('-password')
      .sort(sort as any);

    return { results, totalPage, totalItems };
  }

  async findOne(_id: string) {
    if (!ObjectId.isValidObjectId(_id)) {
      throw new BadRequestException(`ID "${_id}" is not valid.`);
    }

    const result = await this.userModel.findOne({ _id });

    if (!result) {
      throw new BadRequestException(`User id "${_id}" not found.`);
    }

    return getInfo({
      object: result,
      fields: ['_id', 'username', 'email', 'role', 'isActive'],
    });
  }

  async update(_id: string, updateUserDto: UpdateUserDto) {
    if (!ObjectId.isValidObjectId(_id)) {
      throw new BadRequestException(`ID "${_id}" is not valid.`);
    }

    const { username, email, password, role, phone, address, image } =
      updateUserDto;

    // Hash password
    const hashedPassword = await hashPassword(password);

    const filter = { _id };
    const update = {
      username,
      email,
      password: hashedPassword,
      role,
      phone,
      address,
      image,
    };
    const options = { new: true };

    const result = await this.userModel.findOneAndUpdate(
      filter,
      update,
      options,
    );

    if (!result) {
      throw new BadRequestException(`User id "${_id}" not found.`);
    }

    return getInfo({
      object: result,
      fields: [
        '_id',
        'username',
        'email',
        'isActive',
        'role',
        'phone',
        'address',
        'image',
      ],
    });
  }

  async remove(_id: string) {
    if (!ObjectId.isValidObjectId(_id)) {
      throw new BadRequestException(`ID "${_id}" is not valid.`);
    }

    const hasUser = await this.userModel.findById(_id);

    if (!hasUser) {
      throw new NotFoundException('User not found!');
    }

    return hasUser.deleteOne();
  }

  async handleRegister(registerDto: CreateAuthDto) {
    const {
      username,
      email,
      password,
      confirmPassword,
      phone,
      address,
      image,
    } = registerDto;

    if (password !== confirmPassword)
      throw new BadRequestException('Password does not match');

    // Validate password manually inside the service
    if (!this.isValidPassword(password)) {
      throw new BadRequestException(
        'Password must be at least 6 characters long, contain 1 uppercase letter, and 1 special character.',
      );
    }

    // Check user has exist?
    const isUserExist = await this.isUserExist(username);
    if (isUserExist) {
      throw new BadRequestException(
        `Email ${email} already exists. Please use another email!`,
      );
    }

    // Check email has exist?
    const isEmailExist = await this.isEmailExist(email);
    if (isEmailExist) {
      throw new BadRequestException(
        `Email ${email} already exists. Please use another email!`,
      );
    }

    // Generate a unique username
    const baseUsername = this.generateUsername(username);
    let userName = baseUsername;
    let count = 1;

    while (await this.isUserExist(username)) {
      userName = `${baseUsername}${count}`;
      count++;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate a 4-digit numeric activation code
    const activationCode = generateCode(); // Ensures a 4-digit code

    const user = await this.userModel.create({
      username: userName,
      email,
      password: hashedPassword,
      phone: phone,
      address: address,
      image: image,
      isActive: false,
      role: ROLES.user,
      codeId: activationCode,
      codeExpired: dayjs().add(5, 'minutes'),
    });

    // Send mail
    this.mailerService.sendMail({
      to: user.email, // List to reciver
      subject: 'Active your account at HoLLa', // Subject line
      template: 'register',
      context: {
        name: user?.username ?? user?.email,
        activationCode: user.codeId,
      },
    });

    return { _id: user._id, username: user.username, email: user.email };
  }

  async resendCode(resendCodeDto: ResendCodeDto) {
    const { email } = resendCodeDto;

    const foundUser = await this.userModel.findOne({ email });
    if (!foundUser) throw new BadRequestException('Account not found');

    foundUser.codeId = generateCode();
    foundUser.codeExpired = dayjs().add(5, 'minutes').toDate();

    await foundUser.save();

    // Send mail
    this.mailerService.sendMail({
      to: foundUser.email, // List to reciver
      subject: 'Resend code to your account at HoLLa', // Subject line
      template: 'resend-code',
      context: {
        name: foundUser?.username ?? foundUser?.email,
        activationCode: foundUser.codeId,
      },
    });

    return {};
  }

  private isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{6,}$/;
    return passwordRegex.test(password);
  }

  private generateUsername(fullName: string): string {
    return fullName
      .toLowerCase()
      .replace(/\s+/g, '') // Remove spaces
      .replace(/[^a-z0-9]/g, '') // Remove special characters
      .substring(0, 15); // Limit length (optional)
  }
}
