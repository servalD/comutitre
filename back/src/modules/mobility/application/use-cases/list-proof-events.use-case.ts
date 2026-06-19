import { Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/user';
import { ProofEvent } from '../../domain/proof-event';
import { ProofEventRepository } from '../../domain/proof-event.repository';
import { MobilityAccessService } from '../services/mobility-access.service';

@Injectable()
export class ListProofEventsUseCase {
  constructor(
    private readonly proofEventRepository: ProofEventRepository,
    private readonly accessService: MobilityAccessService,
  ) {}

  async execute(user: User, mobilityIdentityId: string): Promise<ProofEvent[]> {
    await this.accessService.assertPermission(
      user,
      mobilityIdentityId,
      'canViewHistory',
    );

    return this.proofEventRepository.listByMobilityIdentityId(
      mobilityIdentityId,
    );
  }
}
