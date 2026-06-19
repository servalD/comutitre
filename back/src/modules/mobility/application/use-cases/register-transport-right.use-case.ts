import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/user';
import { ContractRepository } from '../../domain/contract.repository';
import { ContractStatus } from '../../domain/enums/contract-status.enum';
import { TransportRight } from '../../domain/transport-right';
import { TransportRightRepository } from '../../domain/transport-right.repository';
import { CreateTransportRightRequest } from '../dto/create-transport-right.request';
import { IntegrityHashService } from '../services/integrity-hash.service';
import { MobilityAccessService } from '../services/mobility-access.service';

@Injectable()
export class RegisterTransportRightUseCase {
  constructor(
    private readonly contractRepository: ContractRepository,
    private readonly transportRightRepository: TransportRightRepository,
    private readonly accessService: MobilityAccessService,
    private readonly integrityHash: IntegrityHashService,
  ) {}

  async execute(
    user: User,
    mobilityIdentityId: string,
    request: CreateTransportRightRequest,
  ): Promise<TransportRight> {
    await this.accessService.assertPermission(
      user,
      mobilityIdentityId,
      'canSubscribe',
    );

    const contract = await this.contractRepository.findById(request.contractId);
    if (!contract || contract.mobilityIdentityId !== mobilityIdentityId) {
      throw new BadRequestException('Contract not found for identity');
    }

    if (request.productType !== contract.productType) {
      throw new BadRequestException('Transport right product mismatch');
    }
    if (contract.status !== ContractStatus.ACTIVE) {
      throw new BadRequestException(
        'Contract must be active to create a right',
      );
    }

    return this.transportRightRepository.create({
      mobilityIdentityId,
      contractId: contract.id,
      productType: contract.productType,
      validFrom: contract.validFrom,
      validTo: contract.validTo,
      rightCommitment: this.integrityHash.rightCommitment({
        mobilityIdentityId,
        contractId: contract.id,
        productType: contract.productType,
      }),
    });
  }
}
