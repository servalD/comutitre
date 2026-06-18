import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { FranceConnectCallbackUseCase } from './franceconnect-callback.use-case';
import { SyncUserUseCase } from '../../../users/application/use-cases/sync-user.use-case';
import { InMemoryUserRepository } from '../../../users/infrastructure/in-memory-user.repository';
import { AppJwtService } from '../../infrastructure/app-jwt.service';
import { FranceConnectService } from '../../infrastructure/franceconnect.service';
import { AuthProvider } from '../../../users/domain/user';

describe('FranceConnectCallbackUseCase', () => {
  let useCase: FranceConnectCallbackUseCase;
  let appJwt: AppJwtService;

  beforeEach(() => {
    const repo = new InMemoryUserRepository();
    const jwtService = new JwtService({
      secret: 'test-secret-at-least-16-chars',
      signOptions: { expiresIn: '1h' },
    });
    appJwt = new AppJwtService(jwtService);

    const franceConnect = {
      handleCallback: jest.fn().mockResolvedValue({
        provider: AuthProvider.FRANCECONNECT,
        subject: 'fc-sub',
        email: 'user@fc.test',
        walletAddress: null,
        displayName: 'FC User',
      }),
    } as unknown as FranceConnectService;

    useCase = new FranceConnectCallbackUseCase(
      franceConnect,
      new SyncUserUseCase(repo),
      appJwt,
    );
  });

  it('syncs the user and returns a valid app session token', async () => {
    const result = await useCase.execute('some-code');

    expect(result.userId).toBeDefined();
    const identity = await appJwt.verify(result.accessToken);
    expect(identity.provider).toBe(AuthProvider.FRANCECONNECT);
    expect(identity.subject).toBe('fc-sub');
  });

  it('rejects provider error callbacks without issuing an app session token', async () => {
    await expect(
      useCase.execute({
        error: 'temporarily_unavailable',
        errorDescription: 'Sandbox unavailable',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
