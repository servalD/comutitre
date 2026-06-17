import { Role } from '../../../shared/enums/role.enum';

/**
 * Identity provider that authenticated a user. The back never owns passwords:
 * authentication is delegated to these external providers.
 */
export enum AuthProvider {
  DYNAMIC = 'dynamic',
  FRANCECONNECT = 'franceconnect',
  LOCAL = 'local',
}

/**
 * Pure domain model — no framework / ORM imports allowed here.
 * Persistence is handled by an adapter in the infrastructure layer.
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly provider: AuthProvider,
    public readonly providerSubject: string,
    public readonly email: string | null,
    public readonly walletAddress: string | null,
    public readonly displayName: string | null,
    public readonly roles: Role[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  hasRole(role: Role): boolean {
    return this.roles.includes(role);
  }

  isAdmin(): boolean {
    return this.hasRole(Role.ADMIN);
  }
}
