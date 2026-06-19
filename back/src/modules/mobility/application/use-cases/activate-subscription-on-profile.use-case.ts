import { Injectable, Logger } from '@nestjs/common';
import { ContractRepository } from '../../domain/contract.repository';
import { ContractStatus } from '../../domain/enums/contract-status.enum';
import { MobilityIdentityRepository } from '../../domain/mobility-identity.repository';
import { RelationshipRepository } from '../../domain/relationship.repository';
import { TimelineRecorderService } from '../services/timeline-recorder.service';

const ACTIVATABLE_MOBILITY_STATUSES = new Set<ContractStatus>([
  ContractStatus.DRAFT,
  ContractStatus.PENDING_DOCUMENT,
  ContractStatus.PENDING_PAYMENT,
  ContractStatus.PENDING_PAYER_SIGNATURE,
]);

export interface ActivateSubscriptionOnProfileParams {
  userId: string;
  holderFirstName: string;
  holderLastName: string;
  subscriptionContractId: string;
}

@Injectable()
export class ActivateSubscriptionOnProfileUseCase {
  private readonly logger = new Logger(ActivateSubscriptionOnProfileUseCase.name);

  constructor(
    private readonly relationshipRepository: RelationshipRepository,
    private readonly mobilityIdentityRepository: MobilityIdentityRepository,
    private readonly mobilityContractRepository: ContractRepository,
    private readonly timelineRecorder: TimelineRecorderService,
  ) {}

  async execute(
    params: ActivateSubscriptionOnProfileParams,
  ): Promise<{ mobilityIdentityId: string | null; activated: boolean }> {
    const identity = await this.findHolderIdentity(
      params.userId,
      params.holderFirstName,
      params.holderLastName,
    );
    if (!identity) {
      this.logger.warn(
        `No mobility identity found for holder ${params.holderFirstName} ${params.holderLastName}`,
      );
      return { mobilityIdentityId: null, activated: false };
    }

    const existing = await this.mobilityContractRepository.findByMobilityIdentityId(
      identity.id,
    );
    const toActivate = existing.find((c) =>
      ACTIVATABLE_MOBILITY_STATUSES.has(c.status),
    );
    const alreadyActive = existing.some((c) => c.status === ContractStatus.ACTIVE);

    if (toActivate) {
      await this.mobilityContractRepository.updateStatus(
        toActivate.id,
        ContractStatus.ACTIVE,
      );
      await this.timelineRecorder.recordContractCreated(
        identity.id,
        toActivate.id,
        params.userId,
        {
          productType: toActivate.productType,
          status: ContractStatus.ACTIVE,
          subscriptionContractId: params.subscriptionContractId,
          source: 'subscription_validation',
        },
      );
      return { mobilityIdentityId: identity.id, activated: true };
    }

    return {
      mobilityIdentityId: identity.id,
      activated: alreadyActive,
    };
  }

  private async findHolderIdentity(
    userId: string,
    holderFirstName: string,
    holderLastName: string,
  ) {
    const relationships =
      await this.relationshipRepository.findByAccountId(userId);
    const identityIds = [
      ...new Set(relationships.map((rel) => rel.mobilityIdentityId)),
    ];
    if (identityIds.length === 0) return null;

    const identities =
      await this.mobilityIdentityRepository.findByIds(identityIds);
    const firstNorm = holderFirstName.trim().toLowerCase();
    const lastNorm = holderLastName.trim().toLowerCase();

    return (
      identities.find(
        (identity) =>
          identity.firstName.trim().toLowerCase() === firstNorm &&
          identity.lastName.trim().toLowerCase() === lastNorm,
      ) ?? null
    );
  }
}
