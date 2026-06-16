import { SyncUserUseCase } from './sync-user.use-case';
import { InMemoryUserRepository } from '../../infrastructure/in-memory-user.repository';
import { AuthProvider } from '../../domain/user';
import { Role } from '../../../../shared/enums/role.enum';

describe('SyncUserUseCase', () => {
  let repository: InMemoryUserRepository;
  let useCase: SyncUserUseCase;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    useCase = new SyncUserUseCase(repository);
  });

  const params = {
    provider: AuthProvider.DYNAMIC,
    providerSubject: 'dyn-sub-1',
    email: 'a@b.c',
    walletAddress: '0xabc',
    displayName: 'A',
  };

  it('creates a new user with the default USER role', async () => {
    const user = await useCase.execute(params);

    expect(user.id).toBeDefined();
    expect(user.provider).toBe(AuthProvider.DYNAMIC);
    expect(user.roles).toEqual([Role.USER]);
  });

  it('is idempotent: re-syncing the same identity returns the same user', async () => {
    const first = await useCase.execute(params);
    const second = await useCase.execute({ ...params, displayName: 'A2' });

    expect(second.id).toBe(first.id);
    expect(second.displayName).toBe('A2');
    expect(await repository.findAll()).toHaveLength(1);
  });

  it('does not downgrade roles on re-sync', async () => {
    const created = await useCase.execute(params);
    await repository.updateRoles(created.id, [Role.ADMIN]);

    const resynced = await useCase.execute(params);

    expect(resynced.roles).toEqual([Role.ADMIN]);
  });
});
