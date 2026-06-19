import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { TokenVerifier } from '../src/modules/auth/application/ports/token-verifier.port';
import { ExternalIdentity } from '../src/modules/auth/domain/external-identity';
import { ContractStatus } from '../src/modules/mobility/domain/enums/contract-status.enum';
import { DocumentType } from '../src/modules/mobility/domain/enums/document-type.enum';
import { ProductType } from '../src/modules/mobility/domain/enums/product-type.enum';
import { RelationshipType } from '../src/modules/mobility/domain/enums/relationship-type.enum';
import { SupportStatus } from '../src/modules/mobility/domain/enums/support-status.enum';
import { AuthProvider } from '../src/modules/users/domain/user';

class FakeTokenVerifier extends TokenVerifier {
  verify(token: string): Promise<ExternalIdentity> {
    if (token === 'parent-token') {
      return Promise.resolve({
        provider: AuthProvider.DYNAMIC,
        subject: 'mobility-parent-subject',
        email: 'parent@test.dev',
        walletAddress: null,
        displayName: 'Parent Test',
      });
    }
    return Promise.reject(new Error('invalid token'));
  }
}

describe('Mobility identity (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TokenVerifier)
      .useClass(FakeTokenVerifier)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );

    const dataSource = app.get(DataSource);
    await dataSource.runMigrations();
    await app.init();
  });

  afterAll(async () => {
    const dataSource = app.get(DataSource);
    await dataSource.dropDatabase();
    await app.close();
  });

  it('supports parent identity, child subscription and timeline', async () => {
    const authHeader = { Authorization: 'Bearer parent-token' };

    const parentIdentityRes = await request(app.getHttpServer())
      .post('/mobility-identities')
      .set(authHeader)
      .send({
        firstName: 'Marie',
        lastName: 'Dupont',
        birthDate: '1990-03-15',
        currentProfile: 'adulte',
      })
      .expect(201);

    const parentIdentityId = (parentIdentityRes.body as { id: string }).id;

    await request(app.getHttpServer())
      .post(`/mobility-identities/${parentIdentityId}/contracts`)
      .set(authHeader)
      .send({
        productType: ProductType.IMAGINE_R_ETUDIANT,
        status: ContractStatus.EXPIRED,
        validFrom: '2008-09-01T00:00:00.000Z',
        validTo: '2012-08-31T23:59:59.000Z',
        currentTariff: 250,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/mobility-identities/${parentIdentityId}/contracts`)
      .set(authHeader)
      .send({
        productType: ProductType.NAVIGO_ANNUEL,
        status: ContractStatus.ACTIVE,
        validFrom: '2012-09-01T00:00:00.000Z',
        validTo: '2026-08-31T23:59:59.000Z',
        currentTariff: 900,
      })
      .expect(201);

    const childIdentityRes = await request(app.getHttpServer())
      .post('/mobility-identities')
      .set(authHeader)
      .send({
        firstName: 'Lucas',
        lastName: 'Dupont',
        birthDate: '2015-09-01',
        currentProfile: 'scolaire',
      })
      .expect(201);

    const childIdentityId = (childIdentityRes.body as { id: string }).id;

    await request(app.getHttpServer())
      .post('/relationships')
      .set(authHeader)
      .send({
        mobilityIdentityId: childIdentityId,
        relationshipType: RelationshipType.LEGAL_GUARDIAN,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/relationships')
      .set(authHeader)
      .send({
        mobilityIdentityId: childIdentityId,
        relationshipType: RelationshipType.PAYER,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/mobility-identities/${childIdentityId}/contracts`)
      .set(authHeader)
      .send({
        productType: ProductType.IMAGINE_R_SCOLAIRE,
        status: ContractStatus.ACTIVE,
        validFrom: '2025-09-01T00:00:00.000Z',
        validTo: '2026-08-31T23:59:59.000Z',
        currentTariff: 350,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/mobility-identities/${childIdentityId}/documents`)
      .set(authHeader)
      .send({ type: DocumentType.SCHOOL_CERTIFICATE })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/mobility-identities/${childIdentityId}/supports`)
      .set(authHeader)
      .send({ status: SupportStatus.PENDING_ACTIVATION })
      .expect(201);

    const identitiesRes = await request(app.getHttpServer())
      .get('/users/me/identities')
      .set(authHeader)
      .expect(200);

    const identities = identitiesRes.body as Array<{ firstName: string }>;
    expect(identities).toHaveLength(2);

    const timelineRes = await request(app.getHttpServer())
      .get(`/mobility-identities/${childIdentityId}/timeline`)
      .set(authHeader)
      .expect(200);

    const timeline = timelineRes.body as Array<{ type: string }>;
    expect(timeline.length).toBeGreaterThanOrEqual(4);
  });
});
