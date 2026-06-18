import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../../../users/domain/user';
import { ActorType } from '../../domain/enums/actor-type.enum';
import { FoundSupportDecision } from '../../domain/enums/found-support-decision.enum';
import { FoundSupportFinalStatus } from '../../domain/enums/found-support-final-status.enum';
import { SupportStatus } from '../../domain/enums/support-status.enum';
import { SupportRepository } from '../../domain/support.repository';
import { TimelineEvent } from '../../domain/timeline-event';
import { TimelineEventRepository } from '../../domain/timeline-event.repository';
import { CloseFoundSupportCaseRequest } from '../dto/close-found-support-case.request';

export interface FoundSupportClosureResult {
  id: string;
  supportFoundEventId: string;
  supportId: string;
  mobilityIdentityId: string;
  finalStatus: FoundSupportFinalStatus;
  closedAt: Date;
  closedByAgentId: string;
  withdrawnAt: Date | null;
  withdrawnByAgentId: string | null;
  identityCheckPerformed: boolean;
  withdrawalProofReference: string | null;
  supportStatusAfterClosure: SupportStatus | null;
}

@Injectable()
export class CloseFoundSupportCaseUseCase {
  constructor(
    private readonly supportRepository: SupportRepository,
    private readonly timelineRepository: TimelineEventRepository,
  ) {}

  async execute(
    user: User,
    supportFoundEventId: string,
    request: CloseFoundSupportCaseRequest,
  ): Promise<FoundSupportClosureResult> {
    if (!user.isAdmin()) {
      throw new ForbiddenException(
        'Only agents can close a found support case',
      );
    }

    const event = await this.timelineRepository.findById(supportFoundEventId);
    if (!event) {
      throw new NotFoundException('Found support case not found');
    }
    if (event.type !== 'SUPPORT_FOUND') {
      throw new BadRequestException(
        'Timeline event is not a found support case',
      );
    }

    const supportId =
      this.readStringMetadata(event, 'supportId') ?? event.supportId;
    if (!supportId) {
      throw new BadRequestException('Found support case has no support');
    }

    const support = await this.supportRepository.findById(supportId);
    if (!support) {
      throw new NotFoundException('Support not found');
    }

    const decision = this.readStringMetadata(event, 'decision');
    let supportStatusAfterClosure: SupportStatus | null = null;

    if (request.finalStatus === FoundSupportFinalStatus.WITHDRAWN) {
      this.assertWithdrawalAllowed(decision, support.status, request);
      const updated = await this.supportRepository.updateStatus(
        support.id,
        SupportStatus.ACTIVE,
      );
      supportStatusAfterClosure = updated?.status ?? SupportStatus.ACTIVE;
    }

    if (request.finalStatus === FoundSupportFinalStatus.NOT_CLAIMED) {
      const updated = await this.supportRepository.updateStatus(
        support.id,
        SupportStatus.SUPPORT_NON_RECLAME,
      );
      supportStatusAfterClosure =
        updated?.status ?? SupportStatus.SUPPORT_NON_RECLAME;
    }

    if (request.finalStatus === FoundSupportFinalStatus.UNUSABLE_CONFIRMED) {
      const updated = await this.supportRepository.updateStatus(
        support.id,
        SupportStatus.REVOKED,
      );
      supportStatusAfterClosure = updated?.status ?? SupportStatus.REVOKED;
    }

    const closedAt = new Date();
    const withdrawnAt =
      request.finalStatus === FoundSupportFinalStatus.WITHDRAWN
        ? closedAt
        : null;
    const closureEvent = await this.timelineRepository.append({
      mobilityIdentityId: event.mobilityIdentityId,
      contractId: event.contractId,
      supportId: support.id,
      actorType: ActorType.AGENT,
      actorId: user.id,
      type: 'SUPPORT_FOUND_CLOSED',
      metadata: {
        supportFoundEventId,
        finalStatus: request.finalStatus,
        closedAt: closedAt.toISOString(),
        closedByAgentId: user.id,
        withdrawnAt: withdrawnAt?.toISOString() ?? null,
        withdrawnByAgentId: withdrawnAt ? user.id : null,
        identityCheckPerformed: request.identityCheckPerformed ?? false,
        withdrawalProofReference:
          request.withdrawalProofReference?.trim() || null,
        supportStatusAfterClosure,
      },
    });

    return {
      id: closureEvent.id,
      supportFoundEventId,
      supportId: support.id,
      mobilityIdentityId: event.mobilityIdentityId,
      finalStatus: request.finalStatus,
      closedAt,
      closedByAgentId: user.id,
      withdrawnAt,
      withdrawnByAgentId: withdrawnAt ? user.id : null,
      identityCheckPerformed: request.identityCheckPerformed ?? false,
      withdrawalProofReference:
        request.withdrawalProofReference?.trim() || null,
      supportStatusAfterClosure,
    };
  }

  private assertWithdrawalAllowed(
    decision: string | null,
    currentStatus: SupportStatus,
    request: CloseFoundSupportCaseRequest,
  ): void {
    if (!request.identityCheckPerformed) {
      throw new BadRequestException('Identity check is required');
    }
    if (!request.withdrawalProofReference?.trim()) {
      throw new BadRequestException('Withdrawal proof is required');
    }
    if (
      decision !== FoundSupportDecision.FOUND_PICKUP_ALLOWED &&
      decision !== FoundSupportDecision.CONTROLLED_REUSE_ELIGIBLE
    ) {
      throw new BadRequestException(
        'This support cannot be returned to circulation',
      );
    }
    if (
      currentStatus === SupportStatus.REPLACED ||
      currentStatus === SupportStatus.REVOKED ||
      currentStatus === SupportStatus.EXPIRED
    ) {
      throw new BadRequestException(
        'This support has already been opposed, replaced or expired',
      );
    }
  }

  private readStringMetadata(event: TimelineEvent, key: string): string | null {
    const value = event.metadata?.[key];
    return typeof value === 'string' ? value : null;
  }
}
