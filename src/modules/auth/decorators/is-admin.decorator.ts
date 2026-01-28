// src/modules/auth/decorators/is-admin.decorator.ts
import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { UserRequest } from '../types/user-request';

/**
 * Custom decorator that determines if the currently authenticated user has administrative privileges.
 *
 * This decorator extracts the user information from the HTTP request and checks the `isAdmin`
 * property of the user object. It is primarily used to restrict access to certain routes or
 * functionality to administrative users only.
 *
 * @constant
 *
 * How it works:
 * - Accesses the HTTP request using `ExecutionContext` to retrieve the user information.
 * - Validates if the user object exists in the request.
 * - Logs information about the user, including their username and administrative status.
 * - Returns `true` if the `isAdmin` property of the user object is `true`, otherwise `false`.
 *
 * Use this decorator in controllers or handlers where admin-only access needs to be enforced.
 *
 * Note:
 * - If no user object is found in the request, a warning is logged, and the decorator returns `false`.
 */
export const IsAdmin = createParamDecorator(
  // _data: optionale Daten, die man dem Decorator übergeben könnte
  // ctx: ExecutionContext enthält Informationen über den aktuellen Request
  (_data: unknown, ctx: ExecutionContext) => {
    // Zugriff auf das HTTP-Request-Objekt
    // switchToHttp() ist nötig, weil NestJS auch andere Kontexte kennt (z. B. GraphQL, RPC)
    const request: UserRequest = ctx.switchToHttp().getRequest();
    Logger.log('', 'IsAdmin.decorator.ts');
    const user = request.user;
    if (!user) {
      Logger.warn('User not found in request', 'isAdmin.decorator.ts');
      return false;
    } else {
      Logger.log(
        `User found: ${user.username} IsAdmin: ${JSON.stringify(user, null, 2)}`,
        'is-admin.decorator.ts',
      );
    }
    return user.isAdmin;
  },
);
