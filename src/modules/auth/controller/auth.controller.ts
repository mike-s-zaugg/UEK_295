// src/modules/auth/controller/auth.controller.ts
import { Body, Controller, Get, Logger, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '../decorators';
import { CreateUserDto, ReturnUserDto, SignInDto, TokenInfoDto } from '../dto';
import { AuthGuard } from '../guards/auth.guard';
import { UserService } from '../services/user.service';
import { CorrId } from '../../../decorators/corr-id.decorator';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private userService: UserService) {}

  // region sign-in / login
  /**
   * Handles user sign-in by verifying the provided credentials and returning token information if successful.
   *
   * @param {number} corrId - A correlation ID used for logging and tracing the request.
   * @param {SignInDto} signInDto - Data Transfer Object containing the user's sign-in credentials (e.g., username and password).
   * @return {Promise<TokenInfoDto>} The token information generated upon successful authentication.
   */
  @Post('login')
  @ApiOperation({
    summary: `Sign in a user`,
    description: `Sign in a user resource`,
  })
  @ApiCreatedResponse({
    description: `Return the token info\n\n[Referenz zu HTTP 201](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/201)`,
    type: TokenInfoDto,
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized\n\n[Referenz zu HTTP 401](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/401)',
  })
  @ApiNotFoundResponse({
    description:
      'User not found\n\n[Referenz zu HTTP 404](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/404)',
  })
  @ApiOperation({
    summary: `Sign in a user`,
    description: `Sign in a user resource`,
  })
  @ApiBody({
    type: SignInDto,
  })
  signIn(
    @CorrId() corrId: number,
    @Body() signInDto: SignInDto,
  ): Promise<TokenInfoDto> {
    this.logger.log(
      `${corrId} ${this.signIn.name} with: ${JSON.stringify(signInDto, null, 2)}`,
    );
    return this.userService.signIn(corrId, signInDto);
  }
  // endregion sign-in / login

  // region register a new user
  /**
   * Handles user registration by creating a new user resource.
   *
   * @param {number} corrId - Correlation ID for tracking the request.
   * @param {CreateUserDto} registerDto - Data transfer object containing the registration details.
   * @return {Promise<ReturnUserDto>} The created user resource.
   */
  @Post('register')
  @ApiOperation({
    summary: `Register a new user`,
    description: `Register a new user resource`,
  })
  @ApiCreatedResponse({
    description: `Return the created user resource\n\n[Referenz zu HTTP 201](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/201)`,
    type: ReturnUserDto,
  })
  @ApiBody({
    type: CreateUserDto,
  })
  @ApiConflictResponse({
    description: `The username already exists\n\n[Referenz zu HTTP 409](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/409)`,
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request, validation failed\n\n[Referenz zu HTTP 400](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/400)',
  })
  register(
    @CorrId() corrId: number,
    @Body() registerDto: CreateUserDto,
  ): Promise<ReturnUserDto> {
    this.logger.log(
      `${corrId} ${this.register.name} with: ${JSON.stringify(registerDto, null, 2)}`,
    );
    return this.userService.create(corrId, 0, registerDto);
  }
  // endregion register a new user

  // region get user profile
  /**
   * Retrieves the profile of the authenticated user.
   *
   * @param {ReturnUserDto} user - The user object extracted from the authentication context.
   * @return {ReturnUserDto} The profile object of the authenticated user.
   */
  @Get('profile')
  @ApiOperation({
    summary: `Get the user profile`,
    description: `Return the user profile`,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    description: `Return the user profile\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)`,
    type: ReturnUserDto,
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized\n\n[Referenz zu HTTP 401](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/401)',
  })
  getProfile(@User() user: ReturnUserDto): ReturnUserDto {
    return user;
  }
  // endregion get user profile
}
