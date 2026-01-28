// src/modules/article/dto/return-article.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

/**
 * Data Transfer Object for replacing an article. This class defines the structure and validation rules for the data
 * required to replace an existing article in the system.
 *
 * Properties:
 * - `id`: The unique identifier for the article. This property must be a non-empty number.
 * - `articleName`: The name of the article. This property must be a non-empty string.
 * - `articleDescription`: A brief description of the article. This property must be a non-empty string.
 * - `articlePrice`: The price of the article. This property must be a non-empty number.
 * - `version`: The version number of the article. This property must be a non-empty number.
 */
export class ReplaceArticleDto {
  @ApiProperty({ description: 'id', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id!: number;

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

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  version!: number;
}
