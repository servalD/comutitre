import * as jwt from 'jsonwebtoken';
import { DynamicExternalJwtService } from './dynamic-external-jwt.service';

function config(values: Record<string, unknown>) {
  return {
    get: (key: string) => values[key],
  };
}

describe('DynamicExternalJwtService', () => {
  it('issues a minimal Dynamic-scoped JWT and exposes the matching JWKS', async () => {
    const service = new DynamicExternalJwtService(
      config({
        DYNAMIC_EXTERNAL_JWT_ISSUER: 'http://localhost:3000/api/auth/dynamic',
        DYNAMIC_EXTERNAL_JWT_AUDIENCE: 'dynamic',
        DYNAMIC_EXTERNAL_JWT_KID: 'test-key',
      }) as never,
    );

    const result = await service.issueForUser({
      userId: 'user-1',
      email: 'lina@example.fr',
      holderId: 'holder-1',
      identityProvider: 'franceconnect',
    });

    const claims = jwt.decode(result.externalJwt, { json: true });
    expect(result.externalUserId).toBe('user-1');
    expect(result.issuer).toBe('http://localhost:3000/api/auth/dynamic');
    expect(result.audience).toBe('dynamic');
    expect(result.jwksUrl).toBe(
      'http://localhost:3000/api/auth/dynamic/.well-known/jwks.json',
    );
    expect(claims).toMatchObject({
      iss: 'http://localhost:3000/api/auth/dynamic',
      aud: 'dynamic',
      sub: 'user-1',
      email: 'lina@example.fr',
      emailVerified: true,
      holder_id: 'holder-1',
      identity_provider: 'franceconnect',
    });
    expect(claims).not.toHaveProperty('birthDate');
    expect(claims).not.toHaveProperty('address');

    const jwks = await service.getJwks();
    expect(jwks.keys).toHaveLength(1);
    expect(jwks.keys[0]).toMatchObject({
      kid: 'test-key',
      use: 'sig',
      alg: 'RS256',
      kty: 'RSA',
    });
  });
});
