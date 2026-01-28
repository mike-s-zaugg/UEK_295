import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTodoDto {
  @ApiProperty({ example: 'Einkaufen gehen', minLength: 8, maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  title: string;

  @ApiProperty({ example: 'Milch und Brot', required: false })
  @IsOptional()
  @IsString()
  description: string;
}