import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { TokenVerifier } from '../src/modules/auth/application/ports/token-verifier.port';
import { ExternalIdentity } from '../src/modules/auth/domain/external-identity';
import {
  AppJwtService,
  APP_TOKEN_ISSUER,
} from '../src/modules/auth/infrastructure/app-jwt.service';
import { AuthProvider } from '../src/modules/users/domain/user';
import { UserRepository } from '../src/modules/users/domain/user.repository';
import { Role } from '../src/shared/enums/role.enum';

/**
 * Fake Dynamic verifier for e2e; app session JWTs (register/login/FC) stay real
 * via AppJwtService so local-auth flows exercise the production path.
 */
class E2eTokenVerifier extends TokenVerifier {
  constructor(private readonly appJwt: AppJwtService) {
    super();
  }

  verify(token: string): Promise<ExternalIdentity> {
    if (token === 'valid-token') {
      return Promise.resolve({
        provider: AuthProvider.DYNAMIC,
        subject: 'e2e-subject',
        email: 'e2e@test.dev',
        walletAddress: '0xe2e',
        displayName: 'E2E User',
      });
    }

    const decoded = jwt.decode(token, { json: true });
    if (decoded?.iss === APP_TOKEN_ISSUER) {
      return this.appJwt.verify(token);
    }

    return Promise.reject(new Error('invalid token'));
  }
}

describe('Auth & RBAC (e2e)', () => {
  let app: INestApplication<App>;
  let userRepository: UserRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TokenVerifier)
      .useFactory({
        factory: (appJwt: AppJwtService) => new E2eTokenVerifier(appJwt),
        inject: [AppJwtService],
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );

    // Ensure schema exists (migrations are the source of truth, synchronize is off).
    const dataSource = app.get(DataSource);
    await dataSource.runMigrations();

    userRepository = app.get(UserRepository);
    await app.init();
  });

  afterAll(async () => {
    const dataSource = app.get(DataSource);
    await dataSource.dropDatabase();
    await app.close();
  });

  it('GET /health is public', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('GET /users/me without a token is 401', () => {
    return request(app.getHttpServer()).get('/users/me').expect(401);
  });

  it('POST /auth/register and /auth/login normalize local e-mails at the HTTP boundary', async () => {
    const register = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        firstName: 'Marie',
        lastName: 'Dupont',
        birthDate: '1990-03-15',
        email: '  Marie.Dupont@Example.FR  ',
        password: 'MotDePasse123!',
      })
      .expect(201);

    expect(
      typeof (register.body as { accessToken?: unknown }).accessToken,
    ).toBe('string');

    const token = (register.body as { accessToken: string }).accessToken;

    const identities = await request(app.getHttpServer())
      .get('/users/me/identities')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const list = identities.body as Array<{
      firstName: string;
      lastName: string;
      relationships: Array<{ relationshipType: string }>;
    }>;
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      firstName: 'Marie',
      lastName: 'Dupont',
    });
    expect(list[0].relationships).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ relationshipType: 'owner' }),
      ]),
    );

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: '  MARIE.DUPONT@EXAMPLE.FR  ',
        password: 'MotDePasse123!',
      })
      .expect(200);

    expect(typeof (login.body as { accessToken?: unknown }).accessToken).toBe(
      'string',
    );
  });

  it('GET /users/me with a valid token syncs and returns the user (default USER role)', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    const body = res.body as { provider: string; roles: Role[] };
    expect(body.provider).toBe('dynamic');
    expect(body.roles).toEqual([Role.USER]);
  });

  it('GET /users (admin only) is 403 for a USER', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', 'Bearer valid-token')
      .expect(403);
  });

  it('GET /users (admin only) is 200 once the user is promoted to ADMIN', async () => {
    const me = await userRepository.findByProviderSubject(
      AuthProvider.DYNAMIC,
      'e2e-subject',
    );
    await userRepository.updateRoles(me!.id, [Role.ADMIN]);

    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    const list = res.body as unknown[];
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThanOrEqual(1);
  });
});
