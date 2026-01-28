import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'mikezaugg', description: 'Unique username, min 8 chars', minLength: 8, maxLength: 20 })
    @IsString()
    @IsNotEmpty()
    @Length(8, 20)
    username: string;

    @ApiProperty({ example: 'user@local.test', description: 'Valid email address' })
    @IsString()
    @IsNotEmpty()
    @IsEmail() // Prüfung: gültige E-Mail [cite: 417]
    email: string;

    @ApiProperty({ example: 'Password123!', description: 'Complex password' })
    @IsString()
    @IsNotEmpty()
    @Length(8)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Password too weak. Must contain uppercase, lowercase, number and special char.',
    })
    password: string;
}