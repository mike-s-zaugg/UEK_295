// src/modules/auth/controller/user.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto, ReturnUserDto, UpdateUserAdminDto } from '../dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { IsAdmin, UserId } from '../decorators';
import { AuthGuard } from '../guards/auth.guard';
import { CorrId } from '../../../decorators/corr-id.decorator';

/**
 * UserController provides RESTful API endpoints for managing user resources. It includes
 * operations such as creating, listing, retrieving, updating, and deleting users. The
 * controller is secured with authentication and authorization mechanisms.
 */
@Controller('user')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiInternalServerErrorResponse({
  description:
    'Internal Server Error\n\n[Referenz zu HTTP 500](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/500)',
})
@ApiUnauthorizedResponse({
  description:
    'Unauthorized, the user must be signed in\n\n[Referenz zu HTTP 401](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/401)',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  // region create a resource
  /**
   * Creates a new user resource in the system.
   *
   * @param {number} corrId - A unique correlation identifier for tracking requests.
   * @param {number} userId - The ID of the user making the request.
   * @param {CreateUserDto} createUserDto - Data transfer object containing the information required to create the user.
   * @return {Promise<ReturnUserDto>} Returns a promise resolving to the created user resource.
   */
  @Post()
  @ApiOperation({
    summary: `Create user`,
    description: `Create a new user resource`,
  })
  @ApiConflictResponse({
    description: `The username already exists\n\n[Referenz zu HTTP 409](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/409)`,
  })
  @ApiCreatedResponse({
    description: `Return the created user resource\n\n[Referenz zu HTTP 201](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/201)`,
    type: ReturnUserDto,
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request, validation failed\n\n[Referenz zu HTTP 400](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/400)',
  })
  @ApiBody({ type: CreateUserDto })
  create(
    @CorrId() corrId: number,
    @UserId() userId: number,
    @Body() createUserDto: CreateUserDto,
  ): Promise<ReturnUserDto> {
    return this.userService.create(corrId, userId, createUserDto);
  }
  // endregion create a resource

  // region find all resources
  /**
   * Retrieves all user resources.
   *
   * @param {number} corrId - The unique correlation ID used for tracking the request.
   * @param {boolean} isAdmin - Indicates whether the requesting user has administrative privileges.
   */
  @Get()
  @ApiOperation({
    summary: `Get all user`,
    description: `Return an array of user resources\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)`,
  })
  @ApiOkResponse({
    type: ReturnUserDto,
    isArray: true,
    description: `Return an array of user resources\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)`,
  })
  findAll(@CorrId() corrId: number, @IsAdmin() isAdmin: boolean) {
    if (!isAdmin) {
      return ApiForbiddenResponse({
        description: `The user is not authorized to access this resource\n\n[Referenz zu HTTP 403](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/403)`,
      });
    }
    return this.userService.findAll(corrId);
  }
  // endregion findAll resources

  // region find one resource
  /**
   * Retrieves a user resource based on the provided ID. Ensures that the requesting user has appropriate permissions
   * to access the requested resource.
   *
   * @param {number} corrId - Correlation ID for tracing the request through the system.
   * @param {number} id - The ID of the user resource to retrieve.
   * @param {boolean} isAdmin - Indicates whether the requesting user has administrative privileges.
   * @param {number} userId - The ID of the requesting user.
   * @throws {ApiForbiddenResponse} If the user is not authorized*/
  @Get(':id')
  @ApiOperation({
    summary: `Get user by id`,
    description: `Return a user resource by it's id\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)`,
  })
  @ApiOkResponse({
    type: ReturnUserDto,
    description: `Return the found user resource\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)`,
  })
  @ApiNotFoundResponse({
    description: `The user resource was not found with the requested id\n\n[Referenz zu HTTP 404](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/404)`,
  })
  @ApiForbiddenResponse({
    description: `The user is not authorized to access this resource\n\n[Referenz zu HTTP 403](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/403)`,
  })
  @ApiParam({ name: 'id', type: Number })
  findOne(
    @CorrId() corrId: number,
    @Param('id', ParseIntPipe) id: number,
    @IsAdmin() isAdmin: boolean,
    @UserId() userId: number,
  ) {
    if (!isAdmin && id !== userId) {
      return ApiForbiddenResponse({
        description: `The user is not authorized to access this resource\n\n[Referenz zu HTTP 403](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/403)`,
      });
    }
    return this.userService.findOne(corrId, id);
  }
  // endregion findOne resource

  // region update a resource as Admin
  /**
   * Updates a user resource by ID with the provided data and returns the updated resource.
   *
   * @param {number} corrId - A unique identifier for correlating requests (correlation ID).
   * @param {number} userId - The ID of the user initiating the update request.
   * @param {number} id - The ID of the user resource to be updated.
   * @param {UpdateUserAdminDto} updateUserAdminDto - An object containing the new values to update the user resource.
   * @param {boolean} isAdmin - A flag indicating whether the requesting user has admin privileges.
   */
  @Patch(':id/admin')
  @ApiOperation({
    summary: `Update user`,
    description: `Update a user resource by id with new values and return the updated resource.\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)`,
  })
  @ApiOkResponse({
    type: ReturnUserDto,
    description: `Return the updated user resource\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)`,
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized, the user must be signed in\n\n[Referenz zu HTTP 401](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/401)',
  })
  @ApiNotFoundResponse({
    description: `The user resource was not found with the requested id\n\n[Referenz zu HTTP 404](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/404)`,
  })
  @ApiForbiddenResponse({
    description: `The user is not authorized to access this resource\n\n[Referenz zu HTTP 403](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/403)`,
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request, validation failed\n\n[Referenz zu HTTP 400](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/400)',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateUserAdminDto })
  update(
    @CorrId() corrId: number,
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserAdminDto: UpdateUserAdminDto,
    @IsAdmin() isAdmin: boolean,
  ) {
    if (!isAdmin) {
      return ApiForbiddenResponse({
        description: `The user is not authorized to access this resource\n\n[Referenz zu HTTP 403](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/403)`,
      });
    }
    return this.userService.update(corrId, userId, id, updateUserAdminDto);
  }
  // endregion update a resource as Admin

  // region delete a resource
  /**
   * Deletes a user by their unique identifier.
   *
   * @param {number} corrId - Correlation ID for tracing the operation.
   * @param {number} id - The unique identifier of the user to be deleted.
   * @param {boolean} isAdmin - Indicates whether the requester has admin privileges.
   * @throws {HttpException} If the user is unauthorized or forbidden to delete the resource.
   */
  @Delete(':id')
  @ApiOperation({
    summary: `Delete user`,
    description: `Delete a user by id and return the deleted object\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)\`,`,
  })
  @ApiOkResponse({
    type: ReturnUserDto,
    description: `Return the deleted user resource\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)`,
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized, the user must be signed in\n\n[Referenz zu HTTP 401](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/401)',
  })
  @ApiNotFoundResponse({
    description: `The user resource was not found with the requested id\n\n[Referenz zu HTTP 404](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/404)`,
  })
  @ApiForbiddenResponse({
    description: `The user is not authorized to delete this resource\n\n[Referenz zu HTTP 403](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/403)`,
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request, validation failed\n\n[Referenz zu HTTP 400](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/400)',
  })
  @ApiParam({ name: 'id', type: Number })
  remove(
    @CorrId() corrId: number,
    @Param('id', ParseIntPipe) id: number,
    @IsAdmin() isAdmin: boolean,
  ) {
    if (!isAdmin) {
      throw new HttpException(
        `The user is not authorized to access this resource\n\n[Referenz zu HTTP 403](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/403)`,
        403,
      );
      // return ApiForbiddenResponse({
      //   description: ,
      // });
    }
    return this.userService.remove(corrId, id);
  }
  // endregion delete a resource
}
