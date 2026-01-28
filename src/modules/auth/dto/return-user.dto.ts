// src/modules/auth/dto/return-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsLowercase,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * ReturnUserDto serves as a Data Transfer Object for returning user information.
 * It encapsulates essential details about a user, such as identification, credentials, and audit metadata.
 *
 * Properties:
 * - id: Unique identifier for the user.
 * - username: The username of the user, constrained by length and lowercase requirements.
 * - email: The email address of the user, validated for email formatting.
 * - isAdmin: Specifies whether the user has administrative privileges.
 * - createdAt: Timestamp indicating when the user record was created.
 * - updatedAt: Timestamp indicating the last update to the user record.
 * - version: Record version number, useful for concurrency control.
 * - createdById: Identifier of the user who created this record.
 * - updatedById: Identifier of the user who last updated this record.
 */
export class ReturnUserDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id!: number;

  @ApiProperty({ example: 'user' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  @IsLowercase()
  username!: string;

  @ApiProperty({ example: 'user@local.ch' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'false' })
  @IsBoolean()
  @IsNotEmpty()
  isAdmin!: boolean;

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
