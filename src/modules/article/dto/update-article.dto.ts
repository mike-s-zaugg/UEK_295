// src/modules/article/dto/update-article.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

/**
 * Data Transfer Object (DTO) class for updating an article.
 * Used to encapsulate and validate the data required for updating article details.
 */
export class UpdateArticleDto {
  @ApiProperty({
    description: 'Article Name',
    example: 'Apple',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  articleName?: string;

  @ApiProperty({
    description: 'Article Description',
    example: 'Apple is a fruit',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  articleDescription?: string;

  @ApiProperty({ description: 'Article Price', example: 10, required: false })
  @IsNumber()
  @IsNotEmpty()
  articlePrice?: number;
}
