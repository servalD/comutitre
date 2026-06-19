import { BadRequestException } from '@nestjs/common';
import { AuthProvider, User } from '../../../users/domain/user';
import { Contract } from '../../domain/contract';
import { ContractStatus } from '../../domain/enums/contract-status.enum';
import { ProductType } from '../../domain/enums/product-type.enum';
import { RenewalMode } from '../../domain/enums/renewal-mode.enum';
import { RegisterTransportRightUseCase } from './register-transport-right.use-case';

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

const contract = new Contract(
  'contract-1',
  'identity-1',
  'payer-1',
  ProductType.IMAGINE_R_ETUDIANT,
  ContractStatus.ACTIVE,
  new Date('2026-01-01T00:00:00.000Z'),
  new Date('2027-01-01T00:00:00.000Z'),
  RenewalMode.MANUAL,
  365,
  'CGVU-2026',
  NOW,
  NOW,
);

describe('RegisterTransportRightUseCase', () => {
  it('derives the right from the identity contract and computes the commitment server-side', async () => {
    const create = jest.fn((params) =>
      Promise.resolve({ id: 'right-1', ...params }),
    );
    const useCase = new RegisterTransportRightUseCase(
      {
        findById: jest.fn().mockResolvedValue(contract),
        create: jest.fn(),
        findByMobilityIdentityId: jest.fn(),
      },
      { create, findById: jest.fn(), findByMobilityIdentityId: jest.fn() },
      { assertPermission: jest.fn().mockResolvedValue(undefined) } as never,
      {
        rightCommitment: jest.fn().mockReturnValue('sha256:server'),
      } as never,
    );

    await useCase.execute(user, 'identity-1', {
      contractId: 'contract-1',
      productType: ProductType.IMAGINE_R_ETUDIANT,
      validFrom: '2030-01-01T00:00:00.000Z',
      validTo: '2031-01-01T00:00:00.000Z',
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        contractId: 'contract-1',
        productType: ProductType.IMAGINE_R_ETUDIANT,
        validFrom: contract.validFrom,
        validTo: contract.validTo,
        rightCommitment: 'sha256:server',
      }),
    );
  });

  it('refuses a contract from another identity', async () => {
    const otherContract = new Contract(
      'contract-2',
      'identity-2',
      null,
      ProductType.NAVIGO_ANNUEL,
      ContractStatus.ACTIVE,
      contract.validFrom,
      contract.validTo,
      RenewalMode.MANUAL,
      0,
      null,
      NOW,
      NOW,
    );
    const useCase = new RegisterTransportRightUseCase(
      {
        findById: jest.fn().mockResolvedValue(otherContract),
        create: jest.fn(),
        findByMobilityIdentityId: jest.fn(),
      },
      {
        create: jest.fn(),
        findById: jest.fn(),
        findByMobilityIdentityId: jest.fn(),
      },
      { assertPermission: jest.fn().mockResolvedValue(undefined) } as never,
      { rightCommitment: jest.fn() } as never,
    );

    await expect(
      useCase.execute(user, 'identity-1', {
        contractId: 'contract-2',
        productType: ProductType.NAVIGO_ANNUEL,
        validFrom: '2026-01-01T00:00:00.000Z',
        validTo: '2027-01-01T00:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refuses a non-active contract', async () => {
    const draftContract = new Contract(
      'contract-3',
      'identity-1',
      null,
      ProductType.NAVIGO_ANNUEL,
      ContractStatus.DRAFT,
      contract.validFrom,
      contract.validTo,
      RenewalMode.MANUAL,
      0,
      null,
      NOW,
      NOW,
    );
    const useCase = new RegisterTransportRightUseCase(
      {
        findById: jest.fn().mockResolvedValue(draftContract),
        create: jest.fn(),
        findByMobilityIdentityId: jest.fn(),
      },
      {
        create: jest.fn(),
        findById: jest.fn(),
        findByMobilityIdentityId: jest.fn(),
      },
      { assertPermission: jest.fn().mockResolvedValue(undefined) } as never,
      { rightCommitment: jest.fn() } as never,
    );

    await expect(
      useCase.execute(user, 'identity-1', {
        contractId: 'contract-3',
        productType: ProductType.NAVIGO_ANNUEL,
        validFrom: '2026-01-01T00:00:00.000Z',
        validTo: '2027-01-01T00:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
