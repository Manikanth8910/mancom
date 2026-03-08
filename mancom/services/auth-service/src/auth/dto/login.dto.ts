import { IsEmail, IsString, MinLength, IsIn } from 'class-validator';

export class LoginDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(4)
    password!: string;

    @IsString()
    @IsIn(['user', 'admin'])
    role!: 'user' | 'admin';
}
