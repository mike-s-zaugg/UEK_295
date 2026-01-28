// src/modules/auth/dto/sign-in.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsLowercase, IsNotEmpty } from 'class-validator';

/**
 * Data Transfer Object (DTO) for user sign-in.
 * This class is used to define the structure and validation rules
 * for the data required during the user authentication process.
 *
 * Properties of this class include:
 * - username: Represents the username of the user, expected to be in lowercase.
 * - password: Represents the password of the user.
 *
 * Validation constraints:
 * - Both properties are mandatory and must not be empty.
 * - The username must be in lowercase format.
 *
 * The class leverages decorators to enforce validation rules and provide metadata
 * for descriptive purposes.
 */
export class SignInDto {
  @ApiProperty({ example: 'user1234' })
  @IsNotEmpty()
  @IsLowercase()
  username: string;

  @ApiProperty({ example: 'user12A$' })
  @IsNotEmpty()
  password: string;
}
