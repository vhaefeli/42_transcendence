import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'isSafeCharacterString', async: false })
export class isSafeCharacterStringConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any): boolean | Promise<boolean> {
    return /^[A-Za-z0-9!._-]+$/.test(value);
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `only the characters a-z, A-Z, 0-9 and !._- are allowed for ${validationArguments.property}`;
  }
}

export function IsSafeCharacterString(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'isSafeCharacterString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: isSafeCharacterStringConstraint,
    });
  };
}
