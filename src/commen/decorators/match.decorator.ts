import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

// Custom validator class
@ValidatorConstraint({ name: 'match_between_two_fields', async: false })
export class MatchBetweenFields<T = any>
  implements ValidatorConstraintInterface
{
  validate(value: T, args: ValidationArguments) {
    console.log({
      value,
      args,
      targetFieldname: args.constraints[0],
      targetFieldnameValue: args.object[args.constraints[0]],
    });

    return value === args.object[args.constraints[0]];
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Fail to match src field: ${validationArguments?.property} with target field: ${validationArguments?.constraints?.[0]}`;
  }
}

// Decorator factory
export function IsMatch<T = any>(
  targetField: string,
  // constraints: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [targetField],
      validator: MatchBetweenFields,
    });
  };
}
