import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../../users/domain/user';
import { MobilityIdentity } from '../../domain/mobility-identity';
import { MobilityIdentityRepository } from '../../domain/mobility-identity.repository';
import { MobilityAccessService } from '../services/mobility-access.service';

@Injectable()
export class GetMobilityIdentityUseCase {
  constructor(
    private readonly mobilityIdentityRepository: MobilityIdentityRepository,
    private readonly accessService: MobilityAccessService,
  ) {}

  async execute(user: User, id: string): Promise<MobilityIdentity> {
    await this.accessService.assertPermission(user, id, 'canView');

    const identity = await this.mobilityIdentityRepository.findById(id);
    if (!identity) {
      throw new NotFoundException('Mobility identity not found');
    }

    return identity;
  }
}
