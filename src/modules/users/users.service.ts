import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { isValidObjectId, Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { hashPassword } from '@/helpers';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import aqp from 'api-query-params';
import { getInfo } from '@/utils';
import ObjectId from 'mongoose';
import { UserType } from '@/auth/authUser/auth';
import { ROLES } from '@/constant';
import { MailerService } from '@nestjs-modules/mailer';
import { MediaService } from '../media/media.service';
import { UploadApiOptions } from 'cloudinary';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
    private readonly mediaService: MediaService,
  ) {}

  async findById(_id: string) {
    return await this.userModel.findById(_id);
  }

  async findOneById(_id: string) {
    if (!isValidObjectId(_id)) {
      throw new BadRequestException();
    }

    const result = await this.findById(_id);

    return getInfo({
      object: result,
      fields: ['_id', 'username', 'email', 'role', 'isActive'],
    });
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

  async isUserNameExist(username: string) {
    return !!(await this.userModel.exists({ username }));
  }

  async isEmailExist(email: string) {
    return !!(await this.userModel.exists({ email }));
  }

  async createUser(data: Partial<User>) {
    return await this.userModel.create(data);
  }

  async create(createUserDto: CreateUserDto) {
    const { username, email, password } = createUserDto;

    // Check username has exist?
    const isUserExist = await this.isUserNameExist(username);
    if (isUserExist) {
      throw new BadRequestException(
        'Username already exists. Please use another username!',
      );
    }
    // Check email has exist?
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException(
        `Email ${email} already exists. Please use another email!`,
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
      throw new BadRequestException(`ID "${_id}" is not valid!`);
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
      throw new BadRequestException(`User id "${_id}" not found!`);
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
      throw new BadRequestException(`ID "${_id}" is not valid!`);
    }

    const hasUser = await this.userModel.findById(_id);

    if (!hasUser) {
      throw new NotFoundException('User not found!');
    }

    return hasUser.deleteOne();
  }

  public isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{6,}$/;
    return passwordRegex.test(password);
  }

  public generateUsername(fullName: string): string {
    return fullName
      .toLowerCase()
      .replace(/\s+/g, '') // Remove spaces
      .replace(/[^a-z0-9]/g, '') // Remove special characters
      .substring(0, 15); // Limit length (optional)
  }

  async updateAvatar(
    user_id: Types.ObjectId,
    file: Express.Multer.File,
  ): Promise<UserDocument> {
    const user = await this.userModel.findById(user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.avatarPublicId) {
      await this.mediaService.deleteFile(user.avatarPublicId);
    }

    const uploadOptions: UploadApiOptions = {
      folder: `users/${user_id}/avatars`,
      public_id: `avatar_${user_id}_${Date.now()}`,
      overwrite: true,
      transformation: [
        { width: 250, height: 250, crop: 'fill', gravity: 'face' },
      ],
    };

    const newMedia = await this.mediaService.uploadAndSave(
      file,
      uploadOptions,
      { owner_id: user_id },
    );

    user.avatarUrl = newMedia.secureUrl;
    user.avatarPublicId = newMedia.publicId;

    return user.save();
  }

  async getProfile(_id: string) {
    return await this.userModel.findById(_id).select('-password').lean();
  }
}
