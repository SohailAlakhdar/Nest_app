import { BadRequestException } from '@nestjs/common';
import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
    ValidationOptions,
    registerDecorator,
} from 'class-validator';


/**
 * Class Scope
 */
@ValidatorConstraint({ name: 'check_Fields_Exist', async: false })
export class CheckIfAnyFieldAreApplied implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        console.log(args.object);

        return ((Object.keys(args.object).length > 0) &&
            (Object.values(args.object).some(arg => arg !== undefined)));
    }

    defaultMessage(args: ValidationArguments): string {
        return `At least one field must be provided to update`;
    }
}

/**
 * UpdateBrandDto {
  dummy: undefined,
  extra: undefined,
  slogan: 'just eatt'
}

 * args: {
    targetName: 'UpdateBrandDto',
    property: 'dummy',
    object: UpdateBrandDto {
      dummy: undefined,
      name: 'so sss sddd dsshail',
      slogan: 'just eatt'
    },
    value: undefined,
    constraints: undefined
  }
 */

// Decorator factory
export function CheckUpdateField(validationOptions?: ValidationOptions) {
    return function (constructor: Function) {
        registerDecorator({
            target: constructor,
            propertyName: undefined!,
            options: validationOptions,
            validator: CheckIfAnyFieldAreApplied,
        });
    };
}

/**
 * registerDecorator({
  name: 'decoratorName',
  target: object.constructor,
  propertyName: propertyName,
  options: validationOptions,
  validator: {
    validate(value: any) {
      return true or false;
    },
  },
});
 */