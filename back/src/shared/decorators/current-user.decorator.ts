import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { User } from '../../modules/users/domain/user';

/**
 * Injects the authenticated local user (attached to the request by the global
 * {@link AuthGuard} after token verification + user sync).
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User => {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: User }>();
    return request.user;
  },
);
