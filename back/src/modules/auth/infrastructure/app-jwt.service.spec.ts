import { JwtService } from '@nestjs/jwt';
import { AppJwtService } from './app-jwt.service';
import { AuthProvider } from '../../users/domain/user';
import { ExternalIdentity } from '../domain/external-identity';

describe('AppJwtService', () => {
  let service: AppJwtService;

  beforeEach(() => {
    const jwtService = new JwtService({
      secret: 'test-secret-at-least-16-chars',
      signOptions: { expiresIn: '1h' },
    });
    service = new AppJwtService(jwtService);
  });

  const identity: ExternalIdentity = {
    provider: AuthProvider.FRANCECONNECT,
    subject: 'fc-1',
    email: 'a@b.c',
    walletAddress: null,
    displayName: 'A',
  };

  it('signs and verifies its own session token round-trip', async () => {
    const token = await service.sign(identity);
    const verified = await service.verify(token);
    expect(verified).toEqual(identity);
  });

  it('rejects a tampered/foreign token', async () => {
    await expect(service.verify('not-a-jwt')).rejects.toThrow();
  });
});
