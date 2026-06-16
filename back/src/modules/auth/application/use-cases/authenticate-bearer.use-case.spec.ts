import { AuthenticateBearerUseCase } from './authenticate-bearer.use-case';
import { SyncUserUseCase } from '../../../users/application/use-cases/sync-user.use-case';
import { InMemoryUserRepository } from '../../../users/infrastructure/in-memory-user.repository';
import { TokenVerifier } from '../ports/token-verifier.port';
import { ExternalIdentity } from '../../domain/external-identity';
import { AuthProvider } from '../../../users/domain/user';
import { UnauthorizedException } from '@nestjs/common';

class FakeVerifier extends TokenVerifier {
  verify(token: string): Promise<ExternalIdentity> {
    if (token !== 'good') {
      return Promise.reject(new UnauthorizedException('bad token'));
    }
    return Promise.resolve({
      provider: AuthProvider.DYNAMIC,
      subject: 'sub-1',
      email: 'a@b.c',
      walletAddress: null,
      displayName: 'A',
    });
  }
}

describe('AuthenticateBearerUseCase', () => {
  let useCase: AuthenticateBearerUseCase;

  beforeEach(() => {
    const repo = new InMemoryUserRepository();
    useCase = new AuthenticateBearerUseCase(
      new FakeVerifier(),
      new SyncUserUseCase(repo),
    );
  });

  it('returns the synced local user for a valid token', async () => {
    const user = await useCase.execute('good');
    expect(user.providerSubject).toBe('sub-1');
    expect(user.provider).toBe(AuthProvider.DYNAMIC);
  });

  it('rejects an invalid token', async () => {
    await expect(useCase.execute('bad')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
