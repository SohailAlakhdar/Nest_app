import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { IBrand } from 'src/commen/interfaces/brand.interface';

export class CreateBrandDto implements Partial<IBrand> {
    @IsString()
    @MinLength(2)
    name: string;

    @IsOptional()
    @IsString()
    slogan?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

}
