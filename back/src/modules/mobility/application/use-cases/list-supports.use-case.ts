import { Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/user';
import { Support } from '../../domain/support';
import { SupportRepository } from '../../domain/support.repository';
import { MobilityAccessService } from '../services/mobility-access.service';

@Injectable()
export class ListSupportsUseCase {
  constructor(
    private readonly supportRepository: SupportRepository,
    private readonly accessService: MobilityAccessService,
  ) {}

  async execute(user: User, mobilityIdentityId: string): Promise<Support[]> {
    await this.accessService.assertPermission(
      user,
      mobilityIdentityId,
      'canView',
    );

    return this.supportRepository.findByMobilityIdentityId(mobilityIdentityId);
  }
}
