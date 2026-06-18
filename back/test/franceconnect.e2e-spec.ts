import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

/**
 * Exercises the full FranceConnect login flow against the MOCK provider
 * (FRANCECONNECT_MODE=mock) using the real token verifier: login -> callback ->
 * app session token -> authenticated /auth/me.
 */
describe('FranceConnect mock flow (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.get(DataSource).runMigrations();
    await app.init();
  });

  afterAll(async () => {
    await app.get(DataSource).dropDatabase();
    await app.close();
  });

  it('logs in via the mock provider and returns a working app session token', async () => {
    // Step 1: login redirects to the (mock) FranceConnect authorize URL.
    const login = await request(app.getHttpServer())
      .get('/auth/franceconnect/login')
      .expect(302);

    const authorizeUrl = new URL(login.headers.location);
    const code = authorizeUrl.searchParams.get('code');
    expect(code).toBeTruthy();

    // Step 2: callback exchanges the code and redirects to the front with a token.
    const callback = await request(app.getHttpServer())
      .get('/auth/franceconnect/callback')
      .query({ code })
      .expect(302);

    const fragment = new URL(callback.headers.location).hash;
    const accessToken = new URLSearchParams(fragment.slice(1)).get(
      'access_token',
    );
    expect(accessToken).toBeTruthy();

    // Step 3: the issued app token authenticates against protected routes.
    const me = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const body = me.body as { provider: string };
    expect(body.provider).toBe('franceconnect');
  });

  it('accepts the public FranceConnect callback alias at /callback', async () => {
    const callback = await request(app.getHttpServer())
      .get('/callback')
      .query({ code: 'mock-code-public-callback' })
      .expect(302);

    const fragment = new URL(callback.headers.location).hash;
    const accessToken = new URLSearchParams(fragment.slice(1)).get(
      'access_token',
    );
    expect(accessToken).toBeTruthy();

    const me = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const body = me.body as { provider: string };
    expect(body.provider).toBe('franceconnect');
  });

  it('redirects FranceConnect provider errors without issuing an access token', async () => {
    const callback = await request(app.getHttpServer())
      .get('/callback')
      .query({
        error: 'temporarily_unavailable',
        error_description: 'Sandbox unavailable',
        state: 'demo-state',
      })
      .expect(302);

    const fragment = new URL(callback.headers.location).hash;
    const params = new URLSearchParams(fragment.slice(1));
    expect(params.get('access_token')).toBeNull();
    expect(params.get('error')).toBe('temporarily_unavailable');
    expect(params.get('error_description')).toBe('Sandbox unavailable');
  });
});
