import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from "class-validator";

export class FindAllDto {
    @Type(() => Number)
    @IsPositive()
    @IsOptional()
    @IsNumber()
    page?: number = 1;
    @Type(() => Number)
    @IsPositive()
    @IsOptional()
    @IsNumber()
    @Min(1)
    size?: number = 5;
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    search?: string;
}
