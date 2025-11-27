/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Allow,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
  Validate,
  ValidateIf,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'Match_Between_Feilds', async: false })
export class MatchBetweenFeilds implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    return value === args.object['password'];
  }
  defaultMessage(args: ValidationArguments): string {
    return 'password mismach with confirmPassword';
  }
}
// LoginBodyDto
export class LoginBodyDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;
}
// SignupBodyDto
export class SignupBodyDto extends LoginBodyDto {
  @Length(2, 20)
  @IsString()
  @IsNotEmpty()
  username: string;
  @ValidateIf((data: SignupBodyDto) => {
    return Boolean(data.password);
  })

  @Validate(MatchBetweenFeilds)
  confirmPassword: string;
}
// SignupQueryDto
export class SignupQueryDto {
  @Length(2, 20)
  @IsString()
  flag: string;
}
