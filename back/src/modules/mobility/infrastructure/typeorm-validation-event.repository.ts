import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValidationResult } from '../domain/enums/validation-result.enum';
import { ValidationEvent } from '../domain/validation-event';
import {
  AppendValidationEventParams,
  ValidationEventRepository,
} from '../domain/validation-event.repository';
import { ValidationEventOrmEntity } from './validation-event.orm-entity';

@Injectable()
export class TypeOrmValidationEventRepository extends ValidationEventRepository {
  constructor(
    @InjectRepository(ValidationEventOrmEntity)
    private readonly repository: Repository<ValidationEventOrmEntity>,
  ) {
    super();
  }

  async append(params: AppendValidationEventParams): Promise<ValidationEvent> {
    const entity = this.repository.create({
      mobilityIdentityId: params.mobilityIdentityId,
      transportRightId: params.transportRightId,
      supportId: params.supportId,
      stationId: params.stationId,
      validatorId: params.validatorId,
      result: params.result as ValidationResult,
      reasonCode: params.reasonCode ?? null,
      occurredAt: params.occurredAt,
    });
    return this.toDomain(await this.repository.save(entity));
  }

  async findLastAcceptedByRight(
    transportRightId: string,
  ): Promise<ValidationEvent | null> {
    const entity = await this.repository.findOne({
      where: { transportRightId, result: ValidationResult.ACCEPTED },
      order: { occurredAt: 'DESC' },
    });
    return entity ? this.toDomain(entity) : null;
  }

  private toDomain(entity: ValidationEventOrmEntity): ValidationEvent {
    return new ValidationEvent(
      entity.id,
      entity.mobilityIdentityId,
      entity.transportRightId,
      entity.supportId,
      entity.stationId,
      entity.validatorId,
      entity.result,
      entity.reasonCode,
      entity.occurredAt,
      entity.createdAt,
    );
  }
}
