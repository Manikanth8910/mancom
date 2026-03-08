import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class RequestOtpDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+?[1-9]\d{1,14}$/, {
        message: 'Phone number must be a valid internationally formatted string',
    })
    phone!: string;
}
