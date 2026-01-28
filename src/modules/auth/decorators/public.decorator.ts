// src/modules/auth/decorators/public.decorator.ts
import { CustomDecorator, SetMetadata } from '@nestjs/common';

/**
 * A utility function that applies metadata to indicate that a certain resource
 * or functionality is publicly accessible. This function uses the `SetMetadata`
 * decorator to associate a 'public' key with the provided arguments.
 *
 * @param {...string[]} args - A variable number of string arguments that can
 * be used to provide additional context or identifiers for the public resource.
 * @returns {CustomDecorator} The metadata decorator marking a resource as public.
 */
export const Public = (...args: string[]): CustomDecorator =>
  SetMetadata('public', args);
