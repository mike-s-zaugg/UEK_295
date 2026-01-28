// src/modules/article/dto/return-article.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber } from 'class-validator';

/**
 * Data Transfer Object (DTO) for returning article details. This class defines the structure of
 * the article data that will be sent in responses, including metadata such as creation and update timestamps,
 * and the IDs of the users who created or updated the article. Each field is decorated with metadata to
 * describe its purpose and expected value.
 */
export class ReturnArticleDto {
  @ApiProperty({ description: 'id', example: 1 })
  id!: number;

  @ApiProperty({ description: 'Article Name', example: 'Apple' })
  articleName!: string;

  @ApiProperty({
    description: 'Article Description',
    example: 'Apple is a fruit',
  })
  articleDescription!: string;

  @ApiProperty({ description: 'Article Price', example: 10 })
  articlePrice!: number;

  @ApiProperty({ example: new Date() })
  @IsDate()
  @IsNotEmpty()
  createdAt!: Date;

  @ApiProperty({ example: new Date() })
  @IsDate()
  @IsNotEmpty()
  updatedAt!: Date;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  version!: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  createdById!: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  updatedById!: number;
}
