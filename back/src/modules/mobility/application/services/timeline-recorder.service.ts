import { Injectable } from '@nestjs/common';
import { ActorType } from '../../domain/enums/actor-type.enum';
import { TimelineEventRepository } from '../../domain/timeline-event.repository';

@Injectable()
export class TimelineRecorderService {
  constructor(private readonly timelineRepository: TimelineEventRepository) {}

  recordIdentityCreated(
    mobilityIdentityId: string,
    actorId: string,
    metadata?: Record<string, unknown>,
  ) {
    return this.timelineRepository.append({
      mobilityIdentityId,
      actorType: ActorType.USER,
      actorId,
      type: 'MOBILITY_IDENTITY_CREATED',
      metadata: metadata ?? null,
    });
  }

  recordRelationshipCreated(
    mobilityIdentityId: string,
    actorId: string,
    metadata: Record<string, unknown>,
  ) {
    return this.timelineRepository.append({
      mobilityIdentityId,
      actorType: ActorType.USER,
      actorId,
      type: 'RELATIONSHIP_CREATED',
      metadata,
    });
  }

  recordContractCreated(
    mobilityIdentityId: string,
    contractId: string,
    actorId: string,
    metadata: Record<string, unknown>,
  ) {
    return this.timelineRepository.append({
      mobilityIdentityId,
      contractId,
      actorType: ActorType.USER,
      actorId,
      type: 'CONTRACT_CREATED',
      metadata,
    });
  }

  recordDocumentUploaded(
    mobilityIdentityId: string,
    actorId: string,
    metadata: Record<string, unknown>,
  ) {
    return this.timelineRepository.append({
      mobilityIdentityId,
      actorType: ActorType.USER,
      actorId,
      type: 'DOCUMENT_UPLOADED',
      metadata,
    });
  }

  recordSupportAdded(
    mobilityIdentityId: string,
    supportId: string,
    actorId: string,
    metadata: Record<string, unknown>,
  ) {
    return this.timelineRepository.append({
      mobilityIdentityId,
      supportId,
      actorType: ActorType.USER,
      actorId,
      type: 'SUPPORT_ADDED',
      metadata,
    });
  }

  recordIdentityUpdated(
    mobilityIdentityId: string,
    actorId: string,
    metadata?: Record<string, unknown>,
  ) {
    return this.timelineRepository.append({
      mobilityIdentityId,
      actorType: ActorType.USER,
      actorId,
      type: 'MOBILITY_IDENTITY_UPDATED',
      metadata: metadata ?? null,
    });
  }
}
