import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Types } from 'mongoose';

@ValidatorConstraint({ async: false })
export class IsValidMongoIdConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    return Types.ObjectId.isValid(value);
  }

  defaultMessage(): string {
    return 'ID not correct'; // Custom error message
  }
}

export function IsValidMongoId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsValidMongoId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsValidMongoIdConstraint,
    });
  };
}
