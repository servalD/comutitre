import { Injectable } from '@nestjs/common';
import {
  EligibilityCheckInput,
  EligibilityCheckType,
  VerificationResult,
  VerificationStatus,
} from '../domain/external-api.types';
import { EligibilityDataPort } from '../application/ports/eligibility-data.port';

const MOCK_CHECKED_AT = '2026-06-17T00:00:00.000Z';
const KNOWN_SCENARIOS = new Set([
  'confirmed',
  'unavailable',
  'expired',
  'rejected',
  'provisional',
]);

@Injectable()
export class MockEligibilityDataClient extends EligibilityDataPort {
  check(input: EligibilityCheckInput): Promise<VerificationResult> {
    const scenario = input.scenario ?? 'confirmed';

    if (!KNOWN_SCENARIOS.has(scenario)) {
      return Promise.resolve(
        this.result({
          status: VerificationStatus.REJECTED,
          reasonCode: 'unknown_mock_scenario',
          userMessage:
            'Le scenario de verification simulee est inconnu et requiert une revue manuelle.',
          backOfficeAction: 'manual_review',
        }),
      );
    }

    if (scenario === 'unavailable') {
      return Promise.resolve(
        this.result({
          status: VerificationStatus.NEEDS_DOCUMENT,
          reasonCode: this.unavailableReasonCode(input.type),
          userMessage: this.unavailableMessage(input.type),
          backOfficeAction: 'request_manual_certificate',
        }),
      );
    }

    if (scenario === 'expired') {
      return Promise.resolve(
        this.result({
          status: VerificationStatus.EXPIRED,
          reasonCode: `${input.type}_expired`,
          userMessage: 'Le droit verifie automatiquement est expire.',
          backOfficeAction: 'request_updated_document',
        }),
      );
    }

    if (scenario === 'rejected') {
      return Promise.resolve(
        this.result({
          status: VerificationStatus.REJECTED,
          reasonCode: `${input.type}_rejected`,
          userMessage: 'Les donnees disponibles ne confirment pas ce droit.',
          backOfficeAction: 'manual_review',
        }),
      );
    }

    if (scenario === 'provisional') {
      return Promise.resolve(
        this.result({
          status: VerificationStatus.MANUAL_REVIEW,
          reasonCode: `${input.type}_provisional`,
          userMessage:
            'Le droit semble provisoire et doit etre confirme par un agent.',
          backOfficeAction: 'manual_review',
          expiresAt: '2026-08-31',
        }),
      );
    }

    return Promise.resolve(this.confirmed(input.type));
  }

  private confirmed(type: EligibilityCheckType): VerificationResult {
    const common = {
      status: VerificationStatus.VERIFIED,
      backOfficeAction: 'auto_validate_right',
      expiresAt: '2026-08-31',
    };

    switch (type) {
      case EligibilityCheckType.STUDENT_SCHOLARSHIP:
        return this.result({
          ...common,
          reasonCode: 'student_scholarship_confirmed',
          userMessage: 'Statut boursier etudiant confirme.',
        });
      case EligibilityCheckType.SCHOOL_STUDENT:
        return this.result({
          ...common,
          reasonCode: 'school_student_confirmed',
          userMessage: 'Statut scolaire confirme.',
        });
      case EligibilityCheckType.STUDENT:
        return this.result({
          ...common,
          reasonCode: 'student_status_confirmed',
          userMessage: 'Statut etudiant confirme.',
        });
      case EligibilityCheckType.FAMILY_QUOTIENT:
        return this.result({
          ...common,
          reasonCode: 'family_quotient_confirmed',
          userMessage: 'Quotient familial confirme.',
        });
      case EligibilityCheckType.SOCIAL_RIGHTS:
        return this.result({
          ...common,
          reasonCode: 'social_rights_confirmed',
          userMessage: 'Droit social confirme.',
        });
      case EligibilityCheckType.TAX:
        return this.result({
          status: VerificationStatus.MANUAL_REVIEW,
          reasonCode: 'tax_mock_only',
          userMessage:
            'La verification fiscale est sensible et reste simulee avec controle humain.',
          backOfficeAction: 'manual_review',
        });
    }
  }

  private unavailableMessage(type: EligibilityCheckType): string {
    if (type === EligibilityCheckType.STUDENT) {
      return 'Le statut etudiant ne peut pas etre verifie automatiquement. Un certificat est requis.';
    }

    return 'La verification automatique est indisponible. Un justificatif est requis.';
  }

  private unavailableReasonCode(type: EligibilityCheckType): string {
    if (type === EligibilityCheckType.STUDENT) {
      return 'student_status_unavailable';
    }

    return `${type}_unavailable`;
  }

  private result(
    params: Omit<VerificationResult, 'checkedAt' | 'source'>,
  ): VerificationResult {
    return {
      source: 'api-particulier.mock',
      checkedAt: MOCK_CHECKED_AT,
      ...params,
    };
  }
}
