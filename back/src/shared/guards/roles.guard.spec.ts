import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from '../enums/role.enum';
import { AuthProvider, User } from '../../modules/users/domain/user';

const makeContext = (user: User | undefined): ExecutionContext =>
  ({
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  }) as unknown as ExecutionContext;

const makeUser = (roles: Role[]): User =>
  new User(
    'id',
    AuthProvider.DYNAMIC,
    'sub',
    null,
    null,
    null,
    roles,
    new Date(),
    new Date(),
  );

describe('RolesGuard', () => {
  it('allows routes without @Roles metadata', () => {
    const reflector = {
      getAllAndOverride: () => undefined,
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(makeContext(makeUser([Role.USER])))).toBe(true);
  });

  it('allows a user holding a required role', () => {
    const reflector = {
      getAllAndOverride: () => [Role.ADMIN],
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(makeContext(makeUser([Role.ADMIN])))).toBe(true);
  });

  it('forbids a user missing the required role', () => {
    const reflector = {
      getAllAndOverride: () => [Role.ADMIN],
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(() => guard.canActivate(makeContext(makeUser([Role.USER])))).toThrow(
      ForbiddenException,
    );
  });
});
