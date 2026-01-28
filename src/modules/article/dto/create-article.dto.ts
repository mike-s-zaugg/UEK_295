// src/modules/article/dto/create-article.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

/**
 * Data Transfer Object for creating an article.
 *
 * This class is used to enforce validation rules and associate metadata
 * for the creation of an article. It includes fields for the article's name,
 * description, and price, which are required for the creation process.
 *
 * Validation annotations ensure that the provided values conform to the expected
 * data types and are not empty. Metadata annotations define descriptions and
 * example values for documentation purposes.
 */
export class CreateArticleDto {
  @ApiProperty({ description: 'Article Name', example: 'Apple' })
  @IsString()
  @IsNotEmpty()
  articleName!: string;

  @ApiProperty({
    description: 'Article Description',
    example: 'Apple is a fruit',
  })
  @IsString()
  @IsNotEmpty()
  articleDescription!: string;

  @ApiProperty({ description: 'Article Price', example: 10 })
  @IsNumber()
  @IsNotEmpty()
  articlePrice!: number;
}
