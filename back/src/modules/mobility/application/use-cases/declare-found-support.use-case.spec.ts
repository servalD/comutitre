import { SupportStatus } from '../../domain/enums/support-status.enum';
import { SupportType } from '../../domain/enums/support-type.enum';
import { FoundSupportDecision } from '../../domain/enums/found-support-decision.enum';
import { FoundSupportNotificationStrategy } from '../../domain/enums/found-support-notification-strategy.enum';
import { Profile } from '../../domain/enums/profile.enum';
import { IdentityStatus } from '../../domain/enums/identity-status.enum';
import { Role } from '../../../../shared/enums/role.enum';
import { AuthProvider, User } from '../../../users/domain/user';
import { MobilityIdentity } from '../../domain/mobility-identity';
import { Support } from '../../domain/support';
import { DeclareFoundSupportUseCase } from './declare-found-support.use-case';

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

function makeIdentity(overrides: Partial<MobilityIdentity> = {}) {
  return new MobilityIdentity(
    overrides.id ?? 'identity-1',
    overrides.firstName ?? 'Camille',
    overrides.lastName ?? 'Martin',
    overrides.birthDate ?? new Date('1990-01-01T00:00:00.000Z'),
    null,
    null,
    overrides.currentProfile ?? Profile.ADULTE,
    overrides.status ?? IdentityStatus.ACTIVE,
    NOW,
    NOW,
  );
}

function makeSupport(status: SupportStatus, mobilityIdentityId = 'identity-1') {
  return new Support(
    `support-${status}`,
    mobilityIdentityId,
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

describe('DeclareFoundSupportUseCase', () => {
  let supports: Map<string, Support>;
  let identities: Map<string, MobilityIdentity>;
  let appendedEvents: Array<{
    mobilityIdentityId: string;
    supportId: string | null;
    actorId: string | null;
    type: string;
    metadata: Record<string, unknown> | null;
  }>;
  let useCase: DeclareFoundSupportUseCase;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
    supports = new Map();
    identities = new Map([['identity-1', makeIdentity()]]);
    appendedEvents = [];

    useCase = new DeclareFoundSupportUseCase(
      {
        findById: (id: string) => Promise.resolve(supports.get(id) ?? null),
      },
      {
        findById: (id: string) => Promise.resolve(identities.get(id) ?? null),
      },
      {
        append: (params) => {
          appendedEvents.push({
            mobilityIdentityId: params.mobilityIdentityId,
            supportId: params.supportId ?? null,
            actorId: params.actorId ?? null,
            type: params.type,
            metadata: params.metadata ?? null,
          });
          return Promise.resolve({
            id: `event-${appendedEvents.length}`,
            ...params,
            supportId: params.supportId ?? null,
            contractId: params.contractId ?? null,
            actorId: params.actorId ?? null,
            metadata: params.metadata ?? null,
            createdAt: NOW,
          });
        },
      },
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('marks a lost non-opposed support eligible for controlled circulation with pickup notification', async () => {
    const support = makeSupport(SupportStatus.LOST);
    supports.set(support.id, support);

    const result = await useCase.execute(admin, {
      supportId: support.id,
      agencyId: 'agency-defense',
    });

    expect(result).toMatchObject({
      id: 'event-1',
      supportId: support.id,
      decision: FoundSupportDecision.CONTROLLED_REUSE_ELIGIBLE,
      notificationStrategy: FoundSupportNotificationStrategy.PICKUP_AVAILABLE,
      finalStatus: null,
    });
    expect(result.pickupDeadline?.toISOString()).toBe(
      '2026-07-18T10:00:00.000Z',
    );
    expect(appendedEvents[0]).toMatchObject({
      type: 'SUPPORT_FOUND',
      supportId: support.id,
      actorId: admin.id,
    });
  });

  it('requires back-office review before notification when the support is stolen or flagged risky', async () => {
    const stolen = makeSupport(SupportStatus.STOLEN);
    supports.set(stolen.id, stolen);

    const result = await useCase.execute(admin, {
      supportId: stolen.id,
      agencyId: 'agency-defense',
      riskFlags: ['fraud'],
    });

    expect(result.decision).toBe(
      FoundSupportDecision.BACKOFFICE_REVIEW_REQUIRED,
    );
    expect(result.notificationStrategy).toBe(
      FoundSupportNotificationStrategy.REVIEW_BEFORE_NOTIFICATION,
    );
    expect(result.pickupDeadline).toBeNull();
  });

  it('does not allow circulation for already replaced or unusable supports', async () => {
    const replaced = makeSupport(SupportStatus.REPLACED);
    const revoked = makeSupport(SupportStatus.REVOKED);
    supports.set(replaced.id, replaced);
    supports.set(revoked.id, revoked);

    await expect(
      useCase.execute(admin, {
        supportId: replaced.id,
        agencyId: 'agency-defense',
      }),
    ).resolves.toMatchObject({
      decision: FoundSupportDecision.SUPPORT_ALREADY_REPLACED,
      notificationStrategy:
        FoundSupportNotificationStrategy.SUPPORT_UNUSABLE_NOTICE,
      pickupDeadline: null,
    });

    await expect(
      useCase.execute(admin, {
        supportId: revoked.id,
        agencyId: 'agency-defense',
      }),
    ).resolves.toMatchObject({
      decision: FoundSupportDecision.SUPPORT_UNUSABLE,
      notificationStrategy:
        FoundSupportNotificationStrategy.SUPPORT_UNUSABLE_NOTICE,
      pickupDeadline: null,
    });
  });

  it('returns an unknown support decision without exposing personal data when scan misses', async () => {
    const result = await useCase.execute(admin, {
      supportId: 'missing-support',
      agencyId: 'agency-defense',
    });

    expect(result).toMatchObject({
      id: null,
      supportId: 'missing-support',
      mobilityIdentityId: null,
      decision: FoundSupportDecision.UNKNOWN_SUPPORT,
      notificationStrategy:
        FoundSupportNotificationStrategy.UNKNOWN_SUPPORT_NO_NOTIFICATION,
      pickupDeadline: null,
    });
    expect(appendedEvents).toHaveLength(0);
  });

  it('routes minor notifications to legal guardian or payer channels', async () => {
    const child = makeIdentity({
      id: 'child-identity',
      birthDate: new Date('2015-09-01T00:00:00.000Z'),
      currentProfile: Profile.SCOLAIRE,
    });
    const support = makeSupport(SupportStatus.ACTIVE, child.id);
    identities.set(child.id, child);
    supports.set(support.id, support);

    const result = await useCase.execute(admin, {
      supportId: support.id,
      agencyId: 'agency-defense',
    });

    expect(result.decision).toBe(FoundSupportDecision.FOUND_PICKUP_ALLOWED);
    expect(result.notificationStrategy).toBe(
      FoundSupportNotificationStrategy.LEGAL_GUARDIAN_OR_PAYER,
    );
  });
});
