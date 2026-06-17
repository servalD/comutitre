import { Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/user';
import { Contract } from '../../domain/contract';
import { ContractRepository } from '../../domain/contract.repository';
import { MobilityAccessService } from '../services/mobility-access.service';

@Injectable()
export class ListContractsUseCase {
  constructor(
    private readonly contractRepository: ContractRepository,
    private readonly accessService: MobilityAccessService,
  ) {}

  async execute(user: User, mobilityIdentityId: string): Promise<Contract[]> {
    await this.accessService.assertPermission(
      user,
      mobilityIdentityId,
      'canView',
    );

    return this.contractRepository.findByMobilityIdentityId(mobilityIdentityId);
  }
}
