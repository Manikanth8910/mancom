import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateVisitorDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    purpose!: string;

    @IsString()
    @IsOptional()
    phone?: string;
}
