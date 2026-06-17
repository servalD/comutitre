import { Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/user';
import { Contract } from '../../domain/contract';
import { ContractRepository } from '../../domain/contract.repository';
import { CreateContractRequest } from '../dto/create-contract.request';
import { MobilityAccessService } from '../services/mobility-access.service';
import { TimelineRecorderService } from '../services/timeline-recorder.service';

@Injectable()
export class CreateContractUseCase {
  constructor(
    private readonly contractRepository: ContractRepository,
    private readonly accessService: MobilityAccessService,
    private readonly timelineRecorder: TimelineRecorderService,
  ) {}

  async execute(
    user: User,
    mobilityIdentityId: string,
    request: CreateContractRequest,
  ): Promise<Contract> {
    await this.accessService.assertPermission(
      user,
      mobilityIdentityId,
      'canSubscribe',
    );

    const contract = await this.contractRepository.create({
      mobilityIdentityId,
      payerAccountId: request.payerAccountId ?? user.id,
      productType: request.productType,
      status: request.status,
      validFrom: new Date(request.validFrom),
      validTo: new Date(request.validTo),
      renewalMode: request.renewalMode,
      currentTariff: request.currentTariff,
      cgvVersionAccepted: request.cgvVersionAccepted ?? null,
    });

    await this.timelineRecorder.recordContractCreated(
      mobilityIdentityId,
      contract.id,
      user.id,
      {
        productType: contract.productType,
        status: contract.status,
      },
    );

    return contract;
  }
}
