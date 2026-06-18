import { MockInternalMobilityClient } from './mock-internal-mobility.client';
import {
  InternalMobilityCheckType,
  VerificationStatus,
} from '../domain/external-api.types';

describe('MockInternalMobilityClient', () => {
  let client: MockInternalMobilityClient;

  beforeEach(() => {
    client = new MockInternalMobilityClient();
  });

  it('flags an active payer debt as a blocking back-office action', async () => {
    const result = await client.check({
      type: InternalMobilityCheckType.DEBT,
      scenario: 'debt_active',
    });

    expect(result).toMatchObject({
      status: VerificationStatus.NOT_VERIFIED,
      source: 'comutitres-internal.mock',
      reasonCode: 'debt_active',
      userMessage:
        'Un impaye actif bloque la souscription tant que la situation n est pas regularisee.',
      backOfficeAction: 'regularize_debt',
    });
  });

  it('marks an expired support without confusing support expiry and contract validity', async () => {
    const result = await client.check({
      type: InternalMobilityCheckType.SUPPORT,
      scenario: 'support_expired',
    });

    expect(result).toMatchObject({
      status: VerificationStatus.EXPIRED,
      source: 'comutitres-internal.mock',
      reasonCode: 'support_expired',
      userMessage:
        'Le support est expire. Le contrat peut continuer apres remplacement du support.',
      backOfficeAction: 'replace_support',
    });
  });

  it('fails closed when a mock scenario is unknown', async () => {
    const result = await client.check({
      type: InternalMobilityCheckType.PAYMENT,
      scenario: 'force_payment_success',
    });

    expect(result).toMatchObject({
      status: VerificationStatus.REJECTED,
      reasonCode: 'unknown_mock_scenario',
      backOfficeAction: 'manual_review',
    });
  });
});
