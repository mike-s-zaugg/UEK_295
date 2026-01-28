import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateTodoAdminDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isClosed: boolean;
}