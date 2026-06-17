import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthProvider, User } from '../domain/user';
import {
  CreateLocalUserParams,
  LocalUserCredentials,
  UpsertUserParams,
  UserRepository,
} from '../domain/user.repository';
import { Role } from '../../../shared/enums/role.enum';
import { UserOrmEntity } from './user.orm-entity';

/**
 * TypeORM adapter implementing the {@link UserRepository} port.
 */
@Injectable()
export class TypeOrmUserRepository extends UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByProviderSubject(
    provider: AuthProvider,
    providerSubject: string,
  ): Promise<User | null> {
    const entity = await this.repository.findOne({
      where: { provider, providerSubject },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<User[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => this.toDomain(entity));
  }

  async save(params: UpsertUserParams): Promise<User> {
    const existing = await this.repository.findOne({
      where: {
        provider: params.provider,
        providerSubject: params.providerSubject,
      },
    });

    if (existing) {
      // Keep profile fields fresh; never downgrade roles on sync.
      existing.email = params.email;
      existing.walletAddress = params.walletAddress;
      existing.displayName = params.displayName;
      const saved = await this.repository.save(existing);
      return this.toDomain(saved);
    }

    const created = this.repository.create({
      provider: params.provider,
      providerSubject: params.providerSubject,
      email: params.email,
      walletAddress: params.walletAddress,
      displayName: params.displayName,
      roles: [Role.USER],
    });
    const saved = await this.repository.save(created);
    return this.toDomain(saved);
  }

  async updateRoles(id: string, roles: Role[]): Promise<User> {
    await this.repository.update({ id }, { roles });
    const entity = await this.repository.findOneOrFail({ where: { id } });
    return this.toDomain(entity);
  }

  async findLocalByEmail(email: string): Promise<LocalUserCredentials | null> {
    const entity = await this.repository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.provider = :provider AND user.email = :email', {
        provider: AuthProvider.LOCAL,
        email,
      })
      .getOne();

    if (!entity) return null;
    return { user: this.toDomain(entity), passwordHash: entity.passwordHash! };
  }

  async createLocal(params: CreateLocalUserParams): Promise<User> {
    const created = this.repository.create({
      provider: AuthProvider.LOCAL,
      providerSubject: params.email,
      email: params.email,
      walletAddress: null,
      displayName: `${params.firstName} ${params.lastName}`.trim(),
      passwordHash: params.passwordHash,
      roles: [Role.USER],
    });
    const saved = await this.repository.save(created);
    return this.toDomain(saved);
  }

  private toDomain(entity: UserOrmEntity): User {
    return new User(
      entity.id,
      entity.provider,
      entity.providerSubject,
      entity.email,
      entity.walletAddress,
      entity.displayName,
      entity.roles,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
