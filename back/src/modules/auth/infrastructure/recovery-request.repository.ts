import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecoveryRequestOrmEntity } from './recovery-request.orm-entity';

export interface CreateRecoveryRequestParams {
  mobilityIdentityId: string;
  email: string;
  passwordHash: string;
  verificationCode: string;
  expiresAt: Date;
}

@Injectable()
export class RecoveryRequestRepository {
  constructor(
    @InjectRepository(RecoveryRequestOrmEntity)
    private readonly repository: Repository<RecoveryRequestOrmEntity>,
  ) {}

  async cancelPendingForIdentity(mobilityIdentityId: string): Promise<void> {
    await this.repository.update(
      { mobilityIdentityId, status: 'pending' },
      { status: 'cancelled' },
    );
  }

  async create(
    params: CreateRecoveryRequestParams,
  ): Promise<RecoveryRequestOrmEntity> {
    const entity = this.repository.create({
      mobilityIdentityId: params.mobilityIdentityId,
      email: params.email,
      passwordHash: params.passwordHash,
      verificationCode: params.verificationCode,
      expiresAt: params.expiresAt,
      status: 'pending',
      completedAt: null,
    });
    return this.repository.save(entity);
  }

  async findPendingByEmailAndCode(
    email: string,
    code: string,
  ): Promise<RecoveryRequestOrmEntity | null> {
    return this.repository.findOne({
      where: { email, verificationCode: code, status: 'pending' },
    });
  }

  async markCompleted(id: string): Promise<void> {
    await this.repository.update(id, {
      status: 'completed',
      completedAt: new Date(),
    });
  }
}
