import { CheckEligibilityUseCase } from './check-eligibility.use-case';
import { MockEligibilityDataClient } from '../../infrastructure/mock-eligibility-data.client';
import {
  EligibilityCheckType,
  VerificationStatus,
} from '../../domain/external-api.types';

describe('CheckEligibilityUseCase', () => {
  let useCase: CheckEligibilityUseCase;

  beforeEach(() => {
    useCase = new CheckEligibilityUseCase(new MockEligibilityDataClient());
  });

  it('normalizes a confirmed student scholarship check without exposing raw administrative data', async () => {
    const result = await useCase.execute({
      type: EligibilityCheckType.STUDENT_SCHOLARSHIP,
      scenario: 'confirmed',
    });

    expect(result).toMatchObject({
      status: VerificationStatus.VERIFIED,
      source: 'api-particulier.mock',
      reasonCode: 'student_scholarship_confirmed',
      userMessage: 'Statut boursier etudiant confirme.',
      backOfficeAction: 'auto_validate_right',
    });
    expect(result.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(result.expiresAt).toBe('2026-08-31');
    expect(JSON.stringify(result)).not.toContain('ine');
    expect(JSON.stringify(result)).not.toContain('numeroFiscal');
  });

  it('falls back to a document request when an API Particulier-like source is unavailable', async () => {
    const result = await useCase.execute({
      type: EligibilityCheckType.STUDENT,
      scenario: 'unavailable',
    });

    expect(result).toMatchObject({
      status: VerificationStatus.NEEDS_DOCUMENT,
      source: 'api-particulier.mock',
      reasonCode: 'student_status_unavailable',
      userMessage:
        'Le statut etudiant ne peut pas etre verifie automatiquement. Un certificat est requis.',
      backOfficeAction: 'request_manual_certificate',
    });
  });

  it('fails closed when a mock scenario is unknown', async () => {
    const result = await useCase.execute({
      type: EligibilityCheckType.STUDENT,
      scenario: 'attacker_forced',
    });

    expect(result).toMatchObject({
      status: VerificationStatus.REJECTED,
      reasonCode: 'unknown_mock_scenario',
      backOfficeAction: 'manual_review',
    });
  });
});
