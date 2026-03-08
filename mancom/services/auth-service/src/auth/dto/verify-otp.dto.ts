import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class VerifyOtpDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+?[1-9]\d{1,14}$/, {
        message: 'Phone number must be a valid internationally formatted string',
    })
    phone!: string;

    @IsString()
    @IsNotEmpty()
    otp!: string;
}
