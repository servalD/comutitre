import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthenticateBearerUseCase } from '../../modules/auth/application/use-cases/authenticate-bearer.use-case';

/**
 * Global authentication guard. Verifies the Bearer token (Dynamic or app
 * session), syncs the local user, and attaches it to the request. Routes
 * decorated with @Public() are skipped.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authenticateBearer: AuthenticateBearerUseCase,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing Bearer token');
    }

    const user = await this.authenticateBearer.execute(token);
    (request as Request & { user: typeof user }).user = user;
    return true;
  }

  private extractToken(request: Request): string | null {
    const header = request.headers.authorization ?? '';
    const [type, token] = header.split(' ');
    return type?.toLowerCase() === 'bearer' && token ? token : null;
  }
}
