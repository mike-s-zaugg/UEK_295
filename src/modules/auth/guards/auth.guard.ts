// src/modules/auth/guards/auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UserService } from '../services/user.service';
import { UserRequest } from '../types/user-request';
import { PayloadDto, ReturnUserDto } from '../dto';

/**
 * AuthGuard is a guard implementation that handles user authentication
 * by validating JWT tokens, determining if a route is public, and attaching
 * authenticated user information to the request object.
 *
 * This guard implements the `CanActivate` interface to control access to
 * endpoints based on JWT authentication and optional custom route metadata.
 *
 * Constructor Dependencies:
 * - `JwtService`: Service for handling JSON Web Token (JWT) operations such as verification.
 * - `ConfigService`: Service for accessing application configuration values such as the JWT secret.
 * - `UserService`: Service for handling user-related operations, such as fetching user details.
 * - `Reflector`: Utility for accessing metadata on classes and methods to process route-specific configurations like public access.
 *
 * Methods:
 * - `canActivate(context: ExecutionContext): Promise<boolean>`:
 *   Main guard method executed to determine if a route can be accessed.
 *   It checks for route metadata indicating public access and validates
 *   the incoming JWT token for protected routes. Authenticated user information
 *   is attached to the request object upon successful validation.
 *
 * - `validateTokenAndFetchUser(correlationId: number, token: string): Promise<any>`:
 *   Validates a JWT token, extracts its payload, and fetches the corresponding
 *   user details from the user service. Throws `UnauthorizedException` for invalid
 *   tokens or users that cannot be found.
 *
 * - `extractTokenFromHeader(request: Request): string | undefined`:
 *   Parses the `Authorization` header from the incoming HTTP request to extract the
 *   bearer token. Returns the token if present and properly formatted, or `undefined`
 *   otherwise.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UserService,
    private readonly reflector: Reflector,
  ) {}

  /**
   * Determines whether a request can proceed based on authentication and authorization requirements.
   *
   * @param {ExecutionContext} context - The execution context containing details about the current request.
   * @return {Promise<boolean>} A promise that resolves to `true` if the request is allowed to proceed, otherwise it throws an exception.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    const request: UserRequest = context.switchToHttp().getRequest();

    if (isPublic) {
      Logger.verbose(
        `${request.correlationId} ${AuthGuard.name} is requesting a public endpoint`,
      );
      return true;
    }

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      Logger.error(
        `${request.correlationId} Missing token in request`,
        AuthGuard.name,
      );
      throw new UnauthorizedException();
    }

    const user = await this.validateTokenAndFetchUser(
      request.correlationId,
      token,
    );

    request.user = user;
    Logger.verbose(
      `${request.correlationId} ${AuthGuard.name} user: ${JSON.stringify(user, null, 2)} found!`,
    );
    return true;
  }

  /**
   * Validates the provided token, extracts the payload, and retrieves the associated user.
   *
   * @param {number} correlationId - A unique identifier used for tracking the request flow in logs.
   * @param {string} token - The JWT token to be validated and decoded.
   * @return {Promise<object>} A promise that resolves with the user object associated with the token payload.
   * @throws {UnauthorizedException} If the token is invalid, expired, or if the user cannot be found.
   */
  private async validateTokenAndFetchUser(
    correlationId: number,
    token: string,
  ): Promise<ReturnUserDto> {
    const secret = this.configService.get<string>('JWT_SECRET');

    let payload: PayloadDto;
    try {
      payload = await this.jwtService.verifyAsync<PayloadDto>(token, {
        secret,
      });
    } catch (err) {
      Logger.warn(
        `${correlationId} Invalid/expired token (${err instanceof Error ? err.message : String(err)})`,
        AuthGuard.name,
      );
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.usersService.findOne(correlationId, payload.sub);

    if (!user) {
      Logger.error(`${correlationId} User not found`, AuthGuard.name);
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  /**
   * Extracts the token from the Authorization header of a request.
   *
   * @param {Request} request - The HTTP request object containing the headers.
   * @return {string | undefined} The extracted token if the Authorization header is of type Bearer; otherwise, undefined.
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
