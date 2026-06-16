import { AuthProvider, User } from './user';
import { Role } from '../../../shared/enums/role.enum';

/**
 * Data needed to provision a local user from a verified external identity.
 */
export interface UpsertUserParams {
  provider: AuthProvider;
  providerSubject: string;
  email: string | null;
  walletAddress: string | null;
  displayName: string | null;
}

/**
 * Repository PORT (hexagonal). Used as a DI token; the TypeORM adapter lives in
 * the infrastructure layer and is bound in {@link UsersModule}.
 */
export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByProviderSubject(
    provider: AuthProvider,
    providerSubject: string,
  ): Promise<User | null>;
  abstract findAll(): Promise<User[]>;
  abstract save(params: UpsertUserParams): Promise<User>;
  abstract updateRoles(id: string, roles: Role[]): Promise<User>;
}
