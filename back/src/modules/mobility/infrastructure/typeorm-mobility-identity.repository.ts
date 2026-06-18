import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MobilityIdentity } from '../domain/mobility-identity';
import {
  CreateMobilityIdentityParams,
  MobilityIdentityRepository,
  UpdateMobilityIdentityParams,
} from '../domain/mobility-identity.repository';
import { IdentityStatus } from '../domain/enums/identity-status.enum';
import { MobilityIdentityOrmEntity } from './mobility-identity.orm-entity';
import { ProfileCalculatorService } from '../application/services/profile-calculator.service';

@Injectable()
export class TypeOrmMobilityIdentityRepository extends MobilityIdentityRepository {
  constructor(
    @InjectRepository(MobilityIdentityOrmEntity)
    private readonly repository: Repository<MobilityIdentityOrmEntity>,
    private readonly profileCalculator: ProfileCalculatorService,
  ) {
    super();
  }

  async findById(id: string): Promise<MobilityIdentity | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByIds(ids: string[]): Promise<MobilityIdentity[]> {
    if (ids.length === 0) {
      return [];
    }
    const entities = await this.repository.find({ where: { id: In(ids) } });
    return entities.map((entity) => this.toDomain(entity));
  }

  async create(
    params: CreateMobilityIdentityParams,
  ): Promise<MobilityIdentity> {
    const birthDate = params.birthDate;
    const currentProfile =
      params.currentProfile ??
      this.profileCalculator.calculateFromBirthDate(birthDate);

    const entity = this.repository.create({
      firstName: params.firstName,
      lastName: params.lastName,
      birthDate: this.toDateString(birthDate),
      photoUrl: params.photoUrl ?? null,
      address: params.address ?? null,
      currentProfile,
      status: params.status ?? IdentityStatus.ACTIVE,
    });
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async update(
    id: string,
    params: UpdateMobilityIdentityParams,
  ): Promise<MobilityIdentity> {
    const entity = await this.repository.findOneOrFail({ where: { id } });

    if (params.firstName !== undefined) {
      entity.firstName = params.firstName;
    }
    if (params.lastName !== undefined) {
      entity.lastName = params.lastName;
    }
    if (params.birthDate !== undefined) {
      entity.birthDate = this.toDateString(params.birthDate);
      if (params.currentProfile === undefined) {
        entity.currentProfile = this.profileCalculator.calculateFromBirthDate(
          params.birthDate,
        );
      }
    }
    if (params.photoUrl !== undefined) {
      entity.photoUrl = params.photoUrl;
    }
    if (params.address !== undefined) {
      entity.address = params.address;
    }
    if (params.currentProfile !== undefined) {
      entity.currentProfile = params.currentProfile;
    }
    if (params.status !== undefined) {
      entity.status = params.status;
    }

    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  private toDomain(entity: MobilityIdentityOrmEntity): MobilityIdentity {
    return new MobilityIdentity(
      entity.id,
      entity.firstName,
      entity.lastName,
      new Date(entity.birthDate),
      entity.photoUrl,
      entity.address,
      entity.currentProfile,
      entity.status,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  private toDateString(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
