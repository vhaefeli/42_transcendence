import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { ChannelTypes } from '@prisma/client';

@ValidatorConstraint({ name: 'isChannelType', async: false })
export class isChannelTypeConstraint implements ValidatorConstraintInterface {
  private readonly valid_values = Object.values(ChannelTypes);

  validate(value: any): boolean | Promise<boolean> {
    return this.valid_values.includes(value);
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Valid types for field ${validationArguments.property} are: ${this.valid_values}`;
  }
}

export function IsChannelType(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'isChannelType',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: isChannelTypeConstraint,
    });
  };
}
