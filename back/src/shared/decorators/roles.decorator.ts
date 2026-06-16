import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';

/**
 * Restricts a route to users having at least one of the given roles.
 * Enforced by the global {@link RolesGuard}, which reads the local DB user's roles.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
