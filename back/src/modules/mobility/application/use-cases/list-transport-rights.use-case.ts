import { Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/user';
import { TransportRight } from '../../domain/transport-right';
import { TransportRightRepository } from '../../domain/transport-right.repository';
import { MobilityAccessService } from '../services/mobility-access.service';

@Injectable()
export class ListTransportRightsUseCase {
  constructor(
    private readonly transportRightRepository: TransportRightRepository,
    private readonly accessService: MobilityAccessService,
  ) {}

  async execute(
    user: User,
    mobilityIdentityId: string,
  ): Promise<TransportRight[]> {
    await this.accessService.assertPermission(
      user,
      mobilityIdentityId,
      'canView',
    );

    return this.transportRightRepository.findByMobilityIdentityId(
      mobilityIdentityId,
    );
  }
}
