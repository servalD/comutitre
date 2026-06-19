import { BadRequestException } from '@nestjs/common';
import { AuthProvider, User } from '../../../users/domain/user';
import { SupportStatus } from '../../domain/enums/support-status.enum';
import { CreateSupportUseCase } from './create-support.use-case';

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

describe('CreateSupportUseCase', () => {
  it('refuses direct active support creation so activation keeps the max-2 invariant', async () => {
    const useCase = new CreateSupportUseCase(
      {
        create: jest.fn(),
        findById: jest.fn(),
        findByMobilityIdentityId: jest.fn(),
        updateStatus: jest.fn(),
      },
      { assertPermission: jest.fn().mockResolvedValue(undefined) } as never,
      { recordSupportAdded: jest.fn() } as never,
    );

    await expect(
      useCase.execute(user, 'identity-1', {
        status: SupportStatus.ACTIVE,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
