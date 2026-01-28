// src/modules/user/dto/update-user-admin.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

// special Admin datatype
/**
 * Data Transfer Object (DTO) for updating a user's admin status.
 *
 * This class is used to encapsulate the data required for updating the `isAdmin` property of a user.
 * It includes validation rules and a description for the API schema.
 *
 * Property:
 * - `isAdmin` (boolean): Indicates whether the user has administrative privileges.
 *   This value is mandatory and must be a boolean.
 *
 * Annotations:
 * - `@ApiProperty`: Provides metadata for OpenAPI documentation, including an example value.
 * - `@IsBoolean`: Ensures the value is of boolean type.
 * - `@IsNotEmpty`: Ensures the value is not empty.
 */
export class UpdateUserAdminDto {
  @ApiProperty({ example: 'true' })
  @IsBoolean()
  @IsNotEmpty()
  isAdmin!: boolean;
}
