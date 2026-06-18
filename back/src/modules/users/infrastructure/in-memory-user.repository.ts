import { randomUUID } from 'node:crypto';
import { AuthProvider, User } from '../domain/user';
import {
  CreateLocalUserParams,
  LocalUserCredentials,
  UpsertUserParams,
  UserRepository,
} from '../domain/user.repository';
import { Role } from '../../../shared/enums/role.enum';

/**
 * In-memory {@link UserRepository} for unit tests and e2e provider overrides.
 * No external dependencies — keeps tests fast and deterministic.
 */
export class InMemoryUserRepository extends UserRepository {
  private readonly users = new Map<string, User>();
  private readonly localPasswords = new Map<string, string>();

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.users.get(id) ?? null);
  }

  findByProviderSubject(
    provider: AuthProvider,
    providerSubject: string,
  ): Promise<User | null> {
    const found = [...this.users.values()].find(
      (u) => u.provider === provider && u.providerSubject === providerSubject,
    );
    return Promise.resolve(found ?? null);
  }

  findAll(): Promise<User[]> {
    return Promise.resolve([...this.users.values()]);
  }

  save(params: UpsertUserParams): Promise<User> {
    const existing = [...this.users.values()].find(
      (u) =>
        u.provider === params.provider &&
        u.providerSubject === params.providerSubject,
    );
    const now = new Date();
    const user = new User(
      existing?.id ?? randomUUID(),
      params.provider,
      params.providerSubject,
      params.email,
      params.walletAddress,
      params.displayName,
      existing?.roles ?? [Role.USER],
      existing?.createdAt ?? now,
      now,
    );
    this.users.set(user.id, user);
    return Promise.resolve(user);
  }

  findLocalByEmail(email: string): Promise<LocalUserCredentials | null> {
    const user = [...this.users.values()].find(
      (u) => u.provider === AuthProvider.LOCAL && u.email === email,
    );
    if (!user) return Promise.resolve(null);
    const passwordHash = this.localPasswords.get(user.id);
    if (!passwordHash) return Promise.resolve(null);
    return Promise.resolve({ user, passwordHash });
  }

  createLocal(params: CreateLocalUserParams): Promise<User> {
    const now = new Date();
    const id = randomUUID();
    const user = new User(
      id,
      AuthProvider.LOCAL,
      params.email,
      params.email,
      null,
      `${params.firstName} ${params.lastName}`.trim(),
      [Role.USER],
      now,
      now,
    );
    this.users.set(id, user);
    this.localPasswords.set(id, params.passwordHash);
    return Promise.resolve(user);
  }

  updateRoles(id: string, roles: Role[]): Promise<User> {
    const existing = this.users.get(id);
    if (!existing) {
      throw new Error(`User ${id} not found`);
    }
    const updated = new User(
      existing.id,
      existing.provider,
      existing.providerSubject,
      existing.email,
      existing.walletAddress,
      existing.displayName,
      roles,
      existing.createdAt,
      new Date(),
    );
    this.users.set(id, updated);
    return Promise.resolve(updated);
  }
}
