import { ForbiddenException } from '@nestjs/common';
import { AuthProvider, User } from '../../users/domain/user';
import { AuthController } from './auth.controller';

const NOW = new Date('2026-06-18T10:00:00.000Z');

function user(provider: AuthProvider): User {
  return new User(
    'user-1',
    provider,
    'subject-1',
    'lina@example.fr',
    null,
    'Lina Martin',
    [],
    NOW,
    NOW,
  );
}

function controller(dynamicKind: 'sandbox' | 'live') {
  return new AuthController(
    { get: jest.fn().mockReturnValue(dynamicKind) } as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {
      issueForUser: jest.fn().mockResolvedValue({
        externalJwt: 'token',
        externalUserId: 'user-1',
        expiresIn: 300,
        issuer: 'http://localhost:3000/api/auth/dynamic',
        audience: 'dynamic',
        jwksUrl: 'http://localhost:3000/api/auth/dynamic/.well-known/jwks.json',
      }),
      getJwks: jest.fn(),
    } as never,
  );
}

describe('AuthController Dynamic external JWT', () => {
  it('refuses local users', () => {
    expect(() =>
      controller('sandbox').dynamicExternalToken(user(AuthProvider.LOCAL)),
    ).toThrow(ForbiddenException);
  });

  it('refuses non-sandbox Dynamic environments', () => {
    expect(() =>
      controller('live').dynamicExternalToken(user(AuthProvider.FRANCECONNECT)),
    ).toThrow(ForbiddenException);
  });

  it('issues a token only for FranceConnect users in Dynamic sandbox', async () => {
    await expect(
      controller('sandbox').dynamicExternalToken(
        user(AuthProvider.FRANCECONNECT),
      ),
    ).resolves.toMatchObject({
      externalJwt: 'token',
      externalUserId: 'user-1',
    });
  });
});
