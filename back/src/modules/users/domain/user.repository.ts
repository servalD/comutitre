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
 * Data needed to create a local (email + password) account.
 */
export interface CreateLocalUserParams {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
}

/**
 * Credentials returned for local login; passwordHash is intentionally
 * kept out of the domain User model and only surfaces here for verification.
 */
export interface LocalUserCredentials {
  user: User;
  passwordHash: string;
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
  abstract findLocalByEmail(
    email: string,
  ): Promise<LocalUserCredentials | null>;
  abstract createLocal(params: CreateLocalUserParams): Promise<User>;
}
