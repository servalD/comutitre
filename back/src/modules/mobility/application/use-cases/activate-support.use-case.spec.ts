import { BadRequestException } from '@nestjs/common';
import { AuthProvider, User } from '../../../users/domain/user';
import { SupportStatus } from '../../domain/enums/support-status.enum';
import { SupportType } from '../../domain/enums/support-type.enum';
import { Support } from '../../domain/support';
import { TransportRight } from '../../domain/transport-right';
import { TransportRightStatus } from '../../domain/enums/transport-right-status.enum';
import { ActivateSupportUseCase } from './activate-support.use-case';

const NOW = new Date('2026-06-18T10:00:00.000Z');

const user = new User(
  'user-1',
  AuthProvider.FRANCECONNECT,
  'fc-user-1',
  'lina@example.fr',
  null,
  'Lina Martin',
  [],
  NOW,
  NOW,
);

function makeSupport(id: string, status = SupportStatus.ACTIVE) {
  return new Support(
    id,
    'identity-1',
    'contract-1',
    SupportType.PHYSICAL_CARD,
    status,
    null,
    null,
    'commitment-old',
    NOW,
    null,
    new Date('2030-01-01T00:00:00.000Z'),
    null,
    NOW,
    NOW,
  );
}

const right = new TransportRight(
  'right-1',
  'identity-1',
  'contract-1',
  'imagine_r_etudiant',
  TransportRightStatus.ACTIVE,
  new Date('2020-01-01T00:00:00.000Z'),
  new Date('2099-01-01T00:00:00.000Z'),
  'right-commitment',
  NOW,
  NOW,
);

describe('ActivateSupportUseCase', () => {
  let supports: Support[];
  let createdSupports: Support[];
  let proofEvents: Array<Record<string, unknown>>;
  let rightForLookup: TransportRight;
  let useCase: ActivateSupportUseCase;

  beforeEach(() => {
    supports = [];
    createdSupports = [];
    proofEvents = [];
    rightForLookup = right;
    useCase = new ActivateSupportUseCase(
      {
        findById: jest.fn(),
        findByMobilityIdentityId: () => Promise.resolve(supports),
        create: (params) => {
          const support = new Support(
            `support-${createdSupports.length + 1}`,
            params.mobilityIdentityId,
            params.contractId ?? null,
            params.type ?? SupportType.PHYSICAL_CARD,
            params.status ?? SupportStatus.PENDING_ACTIVATION,
            params.publicKey ?? null,
            params.walletAddress ?? null,
            params.supportCommitment ?? null,
            params.activatedAt ?? null,
            null,
            params.expiresAt ?? null,
            null,
            NOW,
            NOW,
          );
          createdSupports.push(support);
          return Promise.resolve(support);
        },
        updateStatus: jest.fn(),
      },
      {
        findById: (id: string) =>
          Promise.resolve(id === rightForLookup.id ? rightForLookup : null),
        create: jest.fn(),
        findByMobilityIdentityId: jest.fn(),
      },
      {
        append: (params) => {
          proofEvents.push(params);
          return Promise.resolve({
            id: `proof-${proofEvents.length}`,
            ...params,
            previousHash: params.previousHash ?? null,
            payload: params.payload ?? null,
            createdAt: NOW,
          });
        },
        listByMobilityIdentityId: jest.fn(),
        findLatest: jest.fn(),
      },
      {
        assertPermission: jest.fn().mockResolvedValue(undefined),
      } as never,
    );
  });

  it('blocks activation when two supports are already active for the holder', async () => {
    supports = [makeSupport('support-1'), makeSupport('support-2')];

    await expect(
      useCase.execute(user, 'identity-1', {
        transportRightId: 'right-1',
        type: SupportType.PHONE,
        walletAddress: '0xabc',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(createdSupports).toHaveLength(0);
    expect(proofEvents).toHaveLength(0);
  });

  it('refuses activation on a non-active transport right', async () => {
    rightForLookup = new TransportRight(
      'right-1',
      'identity-1',
      'contract-1',
      'imagine_r_etudiant',
      TransportRightStatus.SUSPENDED,
      right.validFrom,
      right.validTo,
      right.rightCommitment,
      NOW,
      NOW,
    );

    await expect(
      useCase.execute(user, 'identity-1', {
        transportRightId: 'right-1',
        type: SupportType.PHONE,
        walletAddress: '0xabc',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(createdSupports).toHaveLength(0);
    expect(proofEvents).toHaveLength(0);
  });

  it('activates a second support and records an integrity proof event', async () => {
    supports = [makeSupport('support-1')];

    const result = await useCase.execute(user, 'identity-1', {
      transportRightId: 'right-1',
      type: SupportType.PHONE,
      walletAddress: '0xabc',
    });

    expect(result.support).toMatchObject({
      type: SupportType.PHONE,
      status: SupportStatus.ACTIVE,
      walletAddress: '0xabc',
    });
    expect(result.support.supportCommitment).toMatch(/^sha256:/);
    expect(result.proofEvent).toMatchObject({
      type: 'SUPPORT_AUTHORIZED',
      mobilityIdentityId: 'identity-1',
      transportRightId: 'right-1',
      supportId: result.support.id,
    });
    expect(result.proofEvent.eventHash).toMatch(/^sha256:/);
  });
});
