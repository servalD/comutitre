import { AuthProvider, User } from '../../../users/domain/user';
import { SupportStatus } from '../../domain/enums/support-status.enum';
import { SupportType } from '../../domain/enums/support-type.enum';
import { TransportRightStatus } from '../../domain/enums/transport-right-status.enum';
import { Support } from '../../domain/support';
import { TransportRight } from '../../domain/transport-right';
import { ValidateJourneyEventUseCase } from './validate-journey-event.use-case';

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

const right = new TransportRight(
  'right-1',
  'identity-1',
  'contract-1',
  'imagine_r_etudiant',
  TransportRightStatus.ACTIVE,
  new Date('2026-01-01T00:00:00.000Z'),
  new Date('2027-01-01T00:00:00.000Z'),
  'right-commitment',
  NOW,
  NOW,
);

const support = new Support(
  'support-phone',
  'identity-1',
  'contract-1',
  SupportType.PHONE,
  SupportStatus.ACTIVE,
  null,
  '0xabc',
  'support-commitment',
  NOW,
  null,
  new Date('2030-01-01T00:00:00.000Z'),
  null,
  NOW,
  NOW,
);

describe('ValidateJourneyEventUseCase', () => {
  let validations: Array<Record<string, unknown>>;
  let anomalies: Array<Record<string, unknown>>;
  let useCase: ValidateJourneyEventUseCase;
  let assertPermission: jest.Mock;
  let supportForLookup: Support;

  beforeEach(() => {
    validations = [];
    anomalies = [];
    assertPermission = jest.fn().mockResolvedValue(undefined);
    supportForLookup = support;
    useCase = new ValidateJourneyEventUseCase(
      {
        findById: (id: string) =>
          Promise.resolve(id === right.id ? right : null),
        create: jest.fn(),
        findByMobilityIdentityId: jest.fn(),
      },
      {
        findById: (id: string) =>
          Promise.resolve(id === supportForLookup.id ? supportForLookup : null),
        findByMobilityIdentityId: jest.fn(),
        create: jest.fn(),
        updateStatus: jest.fn(),
      },
      {
        append: (params) => {
          validations.push(params);
          return Promise.resolve({
            id: `validation-${validations.length}`,
            ...params,
            reasonCode: params.reasonCode ?? null,
            createdAt: NOW,
          });
        },
        findLastAcceptedByRight: () =>
          Promise.resolve(
            validations.find((item) => item.result === 'accepted') ?? null,
          ),
      },
      {
        create: (params) => {
          anomalies.push(params);
          return Promise.resolve({
            id: `anomaly-${anomalies.length}`,
            ...params,
            status: 'open',
            createdAt: NOW,
            updatedAt: NOW,
          });
        },
        listOpen: jest.fn(),
      },
      {
        assertPermission,
      } as never,
    );
  });

  it('accepts the first validation when the right and support are valid', async () => {
    const result = await useCase.execute(user, 'identity-1', {
      transportRightId: 'right-1',
      supportId: 'support-phone',
      stationId: 'gare-de-lyon',
      validatorId: 'validator-1',
      occurredAt: '2026-06-18T08:42:00.000Z',
    });

    expect(result.validation).toMatchObject({
      result: 'accepted',
      reasonCode: null,
    });
    expect(assertPermission).toHaveBeenCalledWith(
      user,
      'identity-1',
      'canManageSupport',
    );
    expect(result.anomaly).toBeNull();
  });

  it('creates an anomaly when two validations are physically impossible in the short window', async () => {
    await useCase.execute(user, 'identity-1', {
      transportRightId: 'right-1',
      supportId: 'support-phone',
      stationId: 'la-defense',
      validatorId: 'validator-1',
      occurredAt: '2026-06-18T08:42:00.000Z',
    });

    const result = await useCase.execute(user, 'identity-1', {
      transportRightId: 'right-1',
      supportId: 'support-phone',
      stationId: 'chatelet',
      validatorId: 'validator-2',
      occurredAt: '2026-06-18T08:44:00.000Z',
    });

    expect(result.validation).toMatchObject({
      result: 'anomaly',
      reasonCode: 'short_window_impossible',
    });
    expect(result.anomaly).toMatchObject({
      type: 'short_window_impossible',
      severity: 'medium',
      status: 'open',
    });
    expect(result.anomaly?.summary).toContain('La Defense');
  });

  it('refuses validation when the support is linked to another contract', async () => {
    supportForLookup = new Support(
      'support-phone',
      'identity-1',
      'contract-2',
      SupportType.PHONE,
      SupportStatus.ACTIVE,
      null,
      '0xabc',
      'support-commitment',
      NOW,
      null,
      new Date('2030-01-01T00:00:00.000Z'),
      null,
      NOW,
      NOW,
    );

    await expect(
      useCase.execute(user, 'identity-1', {
        transportRightId: 'right-1',
        supportId: 'support-phone',
        stationId: 'gare-de-lyon',
        validatorId: 'validator-1',
        occurredAt: '2026-06-18T08:42:00.000Z',
      }),
    ).rejects.toThrow('Support is not linked to this right');
  });
});
