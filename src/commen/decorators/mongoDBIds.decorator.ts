
import { InjectModel } from '@nestjs/mongoose';
import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { Types } from 'mongoose';
import { BrandRepository } from 'src/DB/repository/brand.repository';

export function IsObjectId(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'IsObjectId',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(id: any) {
                    return Types.ObjectId.isValid(id);
                },
                defaultMessage(args: ValidationArguments) {
                    console.log({ args });

                    return `${args.property} must be a valid MongoDB ObjectId`;
                },
            },
        });
    };
}

@ValidatorConstraint({ async: true })
export class BrandExistsValidator implements ValidatorConstraintInterface {
    constructor(
        private readonly brandRepository: BrandRepository
    ) { }

    async validate(id: string, _args?: ValidationArguments): Promise<boolean> {
        if (!id) return true;
        const exists = await this.brandRepository.findOne({
            filter: { _id: id }
        })
        return !!exists;
    }
    defaultMessage(args?: ValidationArguments): string {
        return `Brand with id "${args?.value}" does not exist`;
    }
}
