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

  describe('Parameter matching cases', () => {
    it('matches FAMILY_QUOTIENT (2345678, 75001)', async () => {
      const result = await useCase.execute({
        type: EligibilityCheckType.FAMILY_QUOTIENT,
        numeroAllocataire: '2345678',
        codePostal: '75001',
      });
      expect(result).toMatchObject({
        status: VerificationStatus.VERIFIED,
        reasonCode: 'family_quotient_confirmed',
        userMessage: 'Quotient familial confirme (1234 €).',
        backOfficeAction: 'auto_validate_right',
      });
      expect(result.rawPayload).toBeDefined();
      const payload = result.rawPayload as { quotientFamilial: number };
      expect(payload.quotientFamilial).toBe(1234);
    });

    it('matches FAMILY_QUOTIENT starts with 404', async () => {
      const result = await useCase.execute({
        type: EligibilityCheckType.FAMILY_QUOTIENT,
        numeroAllocataire: '4041234',
      });
      expect(result.status).toBe(VerificationStatus.REJECTED);
      expect(result.reasonCode).toBe('family_quotient_rejected');
    });

    it('matches STUDENT_SCHOLARSHIP (1234567890A)', async () => {
      const result = await useCase.execute({
        type: EligibilityCheckType.STUDENT_SCHOLARSHIP,
        ine: '1234567890A',
      });
      expect(result.status).toBe(VerificationStatus.VERIFIED);
      const payload = result.rawPayload as {
        boursier: boolean;
        echelonBourse: string;
      };
      expect(payload.boursier).toBe(true);
      expect(payload.echelonBourse).toBe('6');
    });

    it('matches SCHOOL_STUDENT (martin, justine)', async () => {
      const result = await useCase.execute({
        type: EligibilityCheckType.SCHOOL_STUDENT,
        nom: 'Martin',
        prenom: 'Justine',
        dateNaissance: '2000-01-20',
      });
      expect(result.status).toBe(VerificationStatus.VERIFIED);
      const payload = result.rawPayload as { eleve: { prenom: string } };
      expect(payload.eleve.prenom).toBe('Justine');
    });

    it('matches TAX (1234567890123)', async () => {
      const result = await useCase.execute({
        type: EligibilityCheckType.TAX,
        numeroFiscal: '1234567890123',
      });
      expect(result.status).toBe(VerificationStatus.VERIFIED);
      const payload = result.rawPayload as { revenuFiscalReference: number };
      expect(payload.revenuFiscalReference).toBe(24500);
    });
  });
});
