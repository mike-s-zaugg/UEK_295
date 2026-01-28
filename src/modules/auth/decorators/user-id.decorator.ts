// src/modules/auth/decorators/user-id.decorator.ts
// Exportiert einen eigenen Parameter-Dekorator namens @CorrId()
import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { UserRequest } from '../types/user-request';

/**
 * A custom parameter decorator for extracting the User ID from the current HTTP request.
 *
 * This decorator retrieves the user object from the request and extracts the `id` property.
 * It is typically used in NestJS controllers to access the authenticated user's ID directly.
 *
 * The decorator leverages the `ExecutionContext` to access the HTTP context and grabs the user
 * information from the request object. If no user is found in the request, a warning is logged.
 *
 * Note:
 * - This decorator assumes that the user object is attached to the `request` object.
 * - Make sure to use appropriate middleware or guards to populate the `request.user` field.
 */
export const UserId = createParamDecorator(
  // _data: optionale Daten, die man dem Decorator übergeben könnte
  // ctx: ExecutionContext enthält Informationen über den aktuellen Request
  (_data: unknown, ctx: ExecutionContext) => {
    // Zugriff auf das HTTP-Request-Objekt
    // switchToHttp() ist nötig, weil NestJS auch andere Kontexte kennt (z. B. GraphQL, RPC)
    const request: UserRequest = ctx.switchToHttp().getRequest();
    Logger.log('', 'UserId.decorator.ts');
    const user = request.user;
    if (!user) {
      Logger.warn('User not found in request', 'UserId.decorator.ts');
    } else {
      Logger.log(
        `User found: ${user.username} UserId: ${JSON.stringify(user, null, 2)}`,
        'is-UserId.decorator.ts',
      );
    }
    return user.id;
  },
);
