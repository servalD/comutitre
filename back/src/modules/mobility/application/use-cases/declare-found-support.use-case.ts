import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/user';
import { ActorType } from '../../domain/enums/actor-type.enum';
import { FoundSupportDecision } from '../../domain/enums/found-support-decision.enum';
import { FoundSupportFinalStatus } from '../../domain/enums/found-support-final-status.enum';
import { FoundSupportNotificationStrategy } from '../../domain/enums/found-support-notification-strategy.enum';
import { FoundSupportRiskFlag } from '../../domain/enums/found-support-risk-flag.enum';
import { SupportStatus } from '../../domain/enums/support-status.enum';
import { MobilityIdentity } from '../../domain/mobility-identity';
import { MobilityIdentityRepository } from '../../domain/mobility-identity.repository';
import { Support } from '../../domain/support';
import { SupportRepository } from '../../domain/support.repository';
import { TimelineEventRepository } from '../../domain/timeline-event.repository';
import { DeclareFoundSupportRequest } from '../dto/declare-found-support.request';

const PICKUP_DEADLINE_DAYS = 30;

const USER_MESSAGE = [
  'Votre pass a été retrouvé en agence.',
  "Il pourra être remis en circulation uniquement s'il n'a pas encore été opposé ou remplacé.",
  "Si ce n'est plus possible, il restera inutilisable et sera traité selon la procédure SAV : conservation temporaire, archivage ou destruction.",
  "Présentez une pièce d'identité en agence pour vérifier les options disponibles.",
];

export interface FoundSupportCaseResult {
  id: string | null;
  supportId: string;
  mobilityIdentityId: string | null;
  contractId: string | null;
  agencyId: string;
  receivedAt: Date;
  agentId: string;
  supportStatus: SupportStatus | null;
  holderMaskedName: string | null;
  decision: FoundSupportDecision;
  notificationStrategy: FoundSupportNotificationStrategy;
  pickupDeadline: Date | null;
  finalStatus: FoundSupportFinalStatus | null;
  userMessage: string[];
}

@Injectable()
export class DeclareFoundSupportUseCase {
  constructor(
    private readonly supportRepository: SupportRepository,
    private readonly identityRepository: MobilityIdentityRepository,
    private readonly timelineRepository: TimelineEventRepository,
  ) {}

  async execute(
    user: User,
    request: DeclareFoundSupportRequest,
  ): Promise<FoundSupportCaseResult> {
    if (!user.isAdmin()) {
      throw new ForbiddenException('Only agents can declare a found support');
    }

    const receivedAt = request.receivedAt
      ? new Date(request.receivedAt)
      : new Date();
    const support = await this.supportRepository.findById(request.supportId);

    if (!support) {
      return {
        id: null,
        supportId: request.supportId,
        mobilityIdentityId: null,
        contractId: null,
        agencyId: request.agencyId,
        receivedAt,
        agentId: user.id,
        supportStatus: null,
        holderMaskedName: null,
        decision: FoundSupportDecision.UNKNOWN_SUPPORT,
        notificationStrategy:
          FoundSupportNotificationStrategy.UNKNOWN_SUPPORT_NO_NOTIFICATION,
        pickupDeadline: null,
        finalStatus: null,
        userMessage: [],
      };
    }

    const identity = await this.identityRepository.findById(
      support.mobilityIdentityId,
    );
    const riskFlags = request.riskFlags ?? [];
    const decision = this.decide(support, identity, riskFlags);
    const notificationStrategy = this.chooseNotificationStrategy(
      decision,
      support,
      identity,
    );
    const pickupDeadline = this.canBePickedUp(decision)
      ? this.addDays(receivedAt, PICKUP_DEADLINE_DAYS)
      : null;

    const event = await this.timelineRepository.append({
      mobilityIdentityId: support.mobilityIdentityId,
      contractId: support.contractId,
      supportId: support.id,
      actorType: ActorType.AGENT,
      actorId: user.id,
      type: 'SUPPORT_FOUND',
      metadata: {
        supportId: support.id,
        agencyId: request.agencyId,
        receivedAt: receivedAt.toISOString(),
        agentId: user.id,
        supportStatus: support.status,
        decision,
        notificationStrategy,
        pickupDeadline: pickupDeadline?.toISOString() ?? null,
        finalStatus: null,
        riskFlags,
        userMessage: USER_MESSAGE,
      },
    });

    return {
      id: event.id,
      supportId: support.id,
      mobilityIdentityId: support.mobilityIdentityId,
      contractId: support.contractId,
      agencyId: request.agencyId,
      receivedAt,
      agentId: user.id,
      supportStatus: support.status,
      holderMaskedName: identity ? this.maskHolder(identity) : null,
      decision,
      notificationStrategy,
      pickupDeadline,
      finalStatus: null,
      userMessage: USER_MESSAGE,
    };
  }

  private decide(
    support: Support,
    identity: MobilityIdentity | null,
    riskFlags: FoundSupportRiskFlag[],
  ): FoundSupportDecision {
    if (
      !identity ||
      support.status === SupportStatus.STOLEN ||
      riskFlags.length > 0
    ) {
      return FoundSupportDecision.BACKOFFICE_REVIEW_REQUIRED;
    }

    if (support.status === SupportStatus.ACTIVE) {
      return FoundSupportDecision.FOUND_PICKUP_ALLOWED;
    }

    if (support.status === SupportStatus.LOST) {
      return FoundSupportDecision.CONTROLLED_REUSE_ELIGIBLE;
    }

    if (support.status === SupportStatus.REPLACED) {
      return FoundSupportDecision.SUPPORT_ALREADY_REPLACED;
    }

    if (
      support.status === SupportStatus.REVOKED ||
      support.status === SupportStatus.EXPIRED ||
      support.status === SupportStatus.SUPPORT_NON_RECLAME
    ) {
      return FoundSupportDecision.SUPPORT_UNUSABLE;
    }

    return FoundSupportDecision.BACKOFFICE_REVIEW_REQUIRED;
  }

  private chooseNotificationStrategy(
    decision: FoundSupportDecision,
    support: Support,
    identity: MobilityIdentity | null,
  ): FoundSupportNotificationStrategy {
    if (decision === FoundSupportDecision.BACKOFFICE_REVIEW_REQUIRED) {
      return FoundSupportNotificationStrategy.REVIEW_BEFORE_NOTIFICATION;
    }

    if (
      decision === FoundSupportDecision.SUPPORT_ALREADY_REPLACED ||
      decision === FoundSupportDecision.SUPPORT_UNUSABLE
    ) {
      return FoundSupportNotificationStrategy.SUPPORT_UNUSABLE_NOTICE;
    }

    if (identity && this.isMinor(identity)) {
      return FoundSupportNotificationStrategy.LEGAL_GUARDIAN_OR_PAYER;
    }

    if (support.status === SupportStatus.ACTIVE) {
      return FoundSupportNotificationStrategy.SECURITY_NOTICE;
    }

    return FoundSupportNotificationStrategy.PICKUP_AVAILABLE;
  }

  private canBePickedUp(decision: FoundSupportDecision): boolean {
    return (
      decision === FoundSupportDecision.FOUND_PICKUP_ALLOWED ||
      decision === FoundSupportDecision.CONTROLLED_REUSE_ELIGIBLE
    );
  }

  private addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + days);
    return next;
  }

  private isMinor(identity: MobilityIdentity): boolean {
    const today = new Date();
    let age = today.getUTCFullYear() - identity.birthDate.getUTCFullYear();
    const monthDiff = today.getUTCMonth() - identity.birthDate.getUTCMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getUTCDate() < identity.birthDate.getUTCDate())
    ) {
      age -= 1;
    }
    return age < 18;
  }

  private maskHolder(identity: MobilityIdentity): string {
    return `${identity.firstName.charAt(0).toUpperCase()}. ${identity.lastName
      .charAt(0)
      .toUpperCase()}.`;
  }
}
