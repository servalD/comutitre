import { BadRequestException } from '@nestjs/common';
import { Role } from '../../../../shared/enums/role.enum';
import { ActorType } from '../../domain/enums/actor-type.enum';
import { FoundSupportDecision } from '../../domain/enums/found-support-decision.enum';
import { FoundSupportFinalStatus } from '../../domain/enums/found-support-final-status.enum';
import { FoundSupportNotificationStrategy } from '../../domain/enums/found-support-notification-strategy.enum';
import { SupportStatus } from '../../domain/enums/support-status.enum';
import { SupportType } from '../../domain/enums/support-type.enum';
import { TimelineEvent } from '../../domain/timeline-event';
import { Support } from '../../domain/support';
import { AuthProvider, User } from '../../../users/domain/user';
import { CloseFoundSupportCaseUseCase } from './close-found-support-case.use-case';

const NOW = new Date('2026-06-18T10:00:00.000Z');

const admin = new User(
  'agent-1',
  AuthProvider.LOCAL,
  'agent-1',
  'agent@comutitres.test',
  null,
  'Agent SAV',
  [Role.ADMIN],
  NOW,
  NOW,
);

function makeFoundEvent(
  decision = FoundSupportDecision.CONTROLLED_REUSE_ELIGIBLE,
) {
  return new TimelineEvent(
    'event-1',
    'identity-1',
    'contract-1',
    'support-1',
    ActorType.AGENT,
    'agent-0',
    'SUPPORT_FOUND',
    {
      supportId: 'support-1',
      agencyId: 'agency-defense',
      decision,
      notificationStrategy: FoundSupportNotificationStrategy.PICKUP_AVAILABLE,
      pickupDeadline: '2026-07-18T10:00:00.000Z',
      finalStatus: null,
    },
    NOW,
  );
}

function makeSupport(status: SupportStatus) {
  return new Support(
    'support-1',
    'identity-1',
    'contract-1',
    SupportType.PHYSICAL_CARD,
    status,
    null,
    NOW,
    null,
    new Date('2030-01-01T00:00:00.000Z'),
    null,
    NOW,
    NOW,
  );
}

describe('CloseFoundSupportCaseUseCase', () => {
  let events: Map<string, TimelineEvent>;
  let supports: Map<string, Support>;
  let statusUpdates: Array<{ id: string; status: SupportStatus }>;
  let appendedTypes: string[];
  let useCase: CloseFoundSupportCaseUseCase;

  beforeEach(() => {
    events = new Map([['event-1', makeFoundEvent()]]);
    supports = new Map([['support-1', makeSupport(SupportStatus.LOST)]]);
    statusUpdates = [];
    appendedTypes = [];
    useCase = new CloseFoundSupportCaseUseCase(
      {
        findById: (id: string) => Promise.resolve(supports.get(id) ?? null),
        updateStatus: (id: string, status: SupportStatus) => {
          statusUpdates.push({ id, status });
          return Promise.resolve(makeSupport(status));
        },
      },
      {
        findById: (id: string) => Promise.resolve(events.get(id) ?? null),
        append: (params) => {
          appendedTypes.push(params.type);
          return Promise.resolve(
            new TimelineEvent(
              `event-${appendedTypes.length + 1}`,
              params.mobilityIdentityId,
              params.contractId ?? null,
              params.supportId ?? null,
              params.actorType,
              params.actorId ?? null,
              params.type,
              params.metadata ?? null,
              NOW,
            ),
          );
        },
      },
    );
  });

  it('requires withdrawal proof before returning a found support to circulation', async () => {
    await expect(
      useCase.execute(admin, 'event-1', {
        finalStatus: FoundSupportFinalStatus.WITHDRAWN,
        identityCheckPerformed: true,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('closes a controlled pickup with proof and restores a lost support to active', async () => {
    const result = await useCase.execute(admin, 'event-1', {
      finalStatus: FoundSupportFinalStatus.WITHDRAWN,
      identityCheckPerformed: true,
      withdrawalProofReference: 'proof-123',
    });

    expect(result).toMatchObject({
      supportFoundEventId: 'event-1',
      supportId: 'support-1',
      finalStatus: FoundSupportFinalStatus.WITHDRAWN,
      identityCheckPerformed: true,
      withdrawalProofReference: 'proof-123',
    });
    expect(result.closedAt).toBeInstanceOf(Date);
    expect(result.closedByAgentId).toBe('agent-1');
    expect(result.withdrawnAt).toBeInstanceOf(Date);
    expect(result.withdrawnByAgentId).toBe('agent-1');
    expect(statusUpdates).toEqual([
      { id: 'support-1', status: SupportStatus.ACTIVE },
    ]);
    expect(appendedTypes).toEqual(['SUPPORT_FOUND_CLOSED']);
  });

  it('marks an unclaimed support with support_non_reclame after pickup deadline', async () => {
    const result = await useCase.execute(admin, 'event-1', {
      finalStatus: FoundSupportFinalStatus.NOT_CLAIMED,
    });

    expect(result.finalStatus).toBe(FoundSupportFinalStatus.NOT_CLAIMED);
    expect(result.closedAt).toBeInstanceOf(Date);
    expect(result.closedByAgentId).toBe('agent-1');
    expect(result.withdrawnAt).toBeNull();
    expect(result.withdrawnByAgentId).toBeNull();
    expect(statusUpdates).toEqual([
      { id: 'support-1', status: SupportStatus.SUPPORT_NON_RECLAME },
    ]);
  });

  it('closes a destroyed support and sets only closedAt/closedByAgentId', async () => {
    const result = await useCase.execute(admin, 'event-1', {
      finalStatus: FoundSupportFinalStatus.DESTROYED,
    });

    expect(result.finalStatus).toBe(FoundSupportFinalStatus.DESTROYED);
    expect(result.closedAt).toBeInstanceOf(Date);
    expect(result.closedByAgentId).toBe('agent-1');
    expect(result.withdrawnAt).toBeNull();
    expect(result.withdrawnByAgentId).toBeNull();
  });

  it('closes a sent_to_backoffice support and sets only closedAt/closedByAgentId', async () => {
    const result = await useCase.execute(admin, 'event-1', {
      finalStatus: FoundSupportFinalStatus.SENT_TO_BACKOFFICE,
    });

    expect(result.finalStatus).toBe(FoundSupportFinalStatus.SENT_TO_BACKOFFICE);
    expect(result.closedAt).toBeInstanceOf(Date);
    expect(result.closedByAgentId).toBe('agent-1');
    expect(result.withdrawnAt).toBeNull();
    expect(result.withdrawnByAgentId).toBeNull();
  });
});
