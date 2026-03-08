import { IsEmail, IsString, IsOptional, MinLength, IsIn } from 'class-validator';

export class SignupDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(4)
    password!: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsIn(['user', 'admin', 'security', 'superadmin'])
    role!: 'user' | 'admin' | 'security' | 'superadmin';
}
