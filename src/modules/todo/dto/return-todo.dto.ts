import { ApiProperty } from '@nestjs/swagger';

export class ReturnTodoDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description: string;

  @ApiProperty()
  isClosed: boolean;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty()
  version: number;

  @ApiProperty()
  createdById: number;

  @ApiProperty()
  updatedById: number;
}