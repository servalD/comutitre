import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/user';
import { AnomalyCase } from '../../domain/anomaly-case';
import { AnomalyCaseRepository } from '../../domain/anomaly-case.repository';

@Injectable()
export class ListOpenAnomaliesUseCase {
  constructor(private readonly anomalyCaseRepository: AnomalyCaseRepository) {}

  async execute(user: User): Promise<AnomalyCase[]> {
    if (!user.isAdmin()) {
      throw new ForbiddenException('Only agents can list anomaly cases');
    }
    return this.anomalyCaseRepository.listOpen();
  }
}
