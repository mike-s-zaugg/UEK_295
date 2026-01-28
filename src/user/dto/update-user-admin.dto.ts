import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateUserAdminDto {
    @ApiProperty({ example: true, description: 'Set admin status' })
    @IsBoolean()
    @IsNotEmpty()
    isAdmin: boolean;
}