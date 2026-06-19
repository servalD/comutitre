import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/user';
import { ProofEvent } from '../../domain/proof-event';
import { ProofEventRepository } from '../../domain/proof-event.repository';
import { SupportStatus } from '../../domain/enums/support-status.enum';
import { TransportRightStatus } from '../../domain/enums/transport-right-status.enum';
import { Support } from '../../domain/support';
import { SupportRepository } from '../../domain/support.repository';
import { TransportRightRepository } from '../../domain/transport-right.repository';
import { ActivateSupportRequest } from '../dto/activate-support.request';
import { IntegrityHashService } from '../services/integrity-hash.service';
import { MobilityAccessService } from '../services/mobility-access.service';

const MAX_ACTIVE_SUPPORTS = 2;

export interface ActivateSupportResult {
  support: Support;
  proofEvent: ProofEvent;
}

@Injectable()
export class ActivateSupportUseCase {
  constructor(
    private readonly supportRepository: SupportRepository,
    private readonly transportRightRepository: TransportRightRepository,
    private readonly proofEventRepository: ProofEventRepository,
    private readonly accessService: MobilityAccessService,
    private readonly integrityHash: IntegrityHashService = new IntegrityHashService(),
  ) {}

  async execute(
    user: User,
    mobilityIdentityId: string,
    request: ActivateSupportRequest,
  ): Promise<ActivateSupportResult> {
    await this.accessService.assertPermission(
      user,
      mobilityIdentityId,
      'canManageSupport',
    );

    const right = await this.transportRightRepository.findById(
      request.transportRightId,
    );
    if (!right || right.mobilityIdentityId !== mobilityIdentityId) {
      throw new BadRequestException('Transport right not found for identity');
    }
    if (
      right.status !== TransportRightStatus.ACTIVE ||
      right.validFrom.getTime() > Date.now() ||
      right.validTo.getTime() < Date.now()
    ) {
      throw new BadRequestException('Transport right is not active');
    }

    const existing =
      await this.supportRepository.findByMobilityIdentityId(mobilityIdentityId);
    const activeCount = existing.filter(
      (support) => support.status === SupportStatus.ACTIVE,
    ).length;
    if (activeCount >= MAX_ACTIVE_SUPPORTS) {
      throw new BadRequestException(
        'Two active supports are already authorized for this right',
      );
    }

    const supportCommitment = this.integrityHash.supportCommitment({
      mobilityIdentityId,
      transportRightId: right.id,
      type: request.type,
      walletAddress: request.walletAddress ?? null,
      publicKey: request.publicKey ?? null,
    });

    const support = await this.supportRepository.create({
      mobilityIdentityId,
      contractId: right.contractId,
      type: request.type,
      status: SupportStatus.ACTIVE,
      publicKey: request.publicKey ?? null,
      walletAddress: request.walletAddress ?? null,
      supportCommitment,
      activatedAt: new Date(),
    });

    const latest = await this.proofEventRepository.findLatest();
    const payload = {
      eventType: 'SUPPORT_AUTHORIZED',
      mobilityIdentityId,
      transportRightId: right.id,
      supportId: support.id,
      supportType: support.type,
      supportCommitment,
      previousHash: latest?.eventHash ?? null,
    };
    const proofEvent = await this.proofEventRepository.append({
      mobilityIdentityId,
      transportRightId: right.id,
      supportId: support.id,
      type: 'SUPPORT_AUTHORIZED',
      previousHash: latest?.eventHash ?? null,
      eventHash: this.integrityHash.hashPayload(payload),
      payload,
    });

    return { support, proofEvent };
  }
}
