import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/user';
import { AnomalyCase } from '../../domain/anomaly-case';
import { AnomalyCaseRepository } from '../../domain/anomaly-case.repository';
import { SupportStatus } from '../../domain/enums/support-status.enum';
import { TransportRightStatus } from '../../domain/enums/transport-right-status.enum';
import { ValidationResult } from '../../domain/enums/validation-result.enum';
import { ValidationEvent } from '../../domain/validation-event';
import { ValidationEventRepository } from '../../domain/validation-event.repository';
import { SupportRepository } from '../../domain/support.repository';
import { TransportRightRepository } from '../../domain/transport-right.repository';
import { ValidateJourneyEventRequest } from '../dto/validate-journey-event.request';
import { MobilityAccessService } from '../services/mobility-access.service';

const STATION_LABELS: Record<string, string> = {
  'gare-de-lyon': 'Gare de Lyon',
  'la-defense': 'La Defense',
  chatelet: 'Chatelet',
  bastille: 'Bastille',
};

const MINIMUM_TRAVEL_MINUTES: Record<string, number> = {
  'la-defense->chatelet': 12,
  'chatelet->la-defense': 12,
  'gare-de-lyon->bastille': 6,
  'bastille->gare-de-lyon': 6,
};

export interface ValidateJourneyEventResult {
  validation: ValidationEvent;
  anomaly: AnomalyCase | null;
}

@Injectable()
export class ValidateJourneyEventUseCase {
  constructor(
    private readonly transportRightRepository: TransportRightRepository,
    private readonly supportRepository: SupportRepository,
    private readonly validationEventRepository: ValidationEventRepository,
    private readonly anomalyCaseRepository: AnomalyCaseRepository,
    private readonly accessService: MobilityAccessService,
  ) {}

  async execute(
    user: User,
    mobilityIdentityId: string,
    request: ValidateJourneyEventRequest,
  ): Promise<ValidateJourneyEventResult> {
    await this.accessService.assertPermission(
      user,
      mobilityIdentityId,
      'canManageSupport',
    );

    const right = await this.transportRightRepository.findById(
      request.transportRightId,
    );
    if (
      !right ||
      right.mobilityIdentityId !== mobilityIdentityId ||
      right.status !== TransportRightStatus.ACTIVE
    ) {
      throw new BadRequestException('Transport right is not active');
    }

    const support = await this.supportRepository.findById(request.supportId);
    if (
      !support ||
      support.mobilityIdentityId !== mobilityIdentityId ||
      support.status !== SupportStatus.ACTIVE
    ) {
      throw new BadRequestException('Support is not active');
    }

    const occurredAt = request.occurredAt
      ? new Date(request.occurredAt)
      : new Date();
    const previous =
      await this.validationEventRepository.findLastAcceptedByRight(right.id);
    if (
      occurredAt.getTime() < right.validFrom.getTime() ||
      occurredAt.getTime() > right.validTo.getTime()
    ) {
      throw new BadRequestException(
        'Transport right is outside validity period',
      );
    }
    if (support.contractId !== right.contractId) {
      throw new BadRequestException('Support is not linked to this right');
    }
    const impossible = previous
      ? this.isShortWindowImpossible(previous, request.stationId, occurredAt)
      : false;

    const validation = await this.validationEventRepository.append({
      mobilityIdentityId,
      transportRightId: right.id,
      supportId: support.id,
      stationId: request.stationId,
      validatorId: request.validatorId,
      occurredAt,
      result: impossible ? ValidationResult.ANOMALY : ValidationResult.ACCEPTED,
      reasonCode: impossible ? 'short_window_impossible' : null,
    });

    if (!impossible || !previous) {
      return { validation, anomaly: null };
    }

    const anomaly = await this.anomalyCaseRepository.create({
      mobilityIdentityId,
      transportRightId: right.id,
      supportId: support.id,
      type: 'short_window_impossible',
      severity: 'medium',
      summary: `${this.label(previous.stationId)} puis ${this.label(
        request.stationId,
      )} en ${Math.round(
        (occurredAt.getTime() - previous.occurredAt.getTime()) / 60_000,
      )} min : deux validations sont impossibles dans la fenetre courte.`,
    });

    return { validation, anomaly };
  }

  private isShortWindowImpossible(
    previous: ValidationEvent,
    nextStationId: string,
    nextAt: Date,
  ): boolean {
    if (previous.stationId === nextStationId) {
      return false;
    }
    const elapsedMinutes =
      (nextAt.getTime() - previous.occurredAt.getTime()) / 60_000;
    const requiredMinutes =
      MINIMUM_TRAVEL_MINUTES[`${previous.stationId}->${nextStationId}`] ?? 5;
    return elapsedMinutes >= 0 && elapsedMinutes < requiredMinutes;
  }

  private label(stationId: string): string {
    return STATION_LABELS[stationId] ?? stationId;
  }
}
