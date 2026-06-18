import { Injectable } from '@nestjs/common';
import {
  InternalMobilityCheckInput,
  InternalMobilityCheckType,
  VerificationResult,
  VerificationStatus,
} from '../domain/external-api.types';
import { InternalMobilityPort } from '../application/ports/internal-mobility.port';

const MOCK_CHECKED_AT = '2026-06-17T00:00:00.000Z';
const KNOWN_SCENARIOS = new Set([
  'contract_active',
  'debt_active',
  'no_debt',
  'payment_failure',
  'payment_success',
  'support_compatible',
  'support_expired',
]);

@Injectable()
export class MockInternalMobilityClient extends InternalMobilityPort {
  check(input: InternalMobilityCheckInput): Promise<VerificationResult> {
    const scenario = input.scenario ?? this.defaultScenario(input.type);

    if (!KNOWN_SCENARIOS.has(scenario)) {
      return Promise.resolve(
        this.result({
          status: VerificationStatus.REJECTED,
          reasonCode: 'unknown_mock_scenario',
          userMessage:
            'Le scenario SI simule est inconnu et requiert une revue manuelle.',
          backOfficeAction: 'manual_review',
        }),
      );
    }

    switch (scenario) {
      case 'debt_active':
        return Promise.resolve(
          this.result({
            status: VerificationStatus.NOT_VERIFIED,
            reasonCode: 'debt_active',
            userMessage:
              'Un impaye actif bloque la souscription tant que la situation n est pas regularisee.',
            backOfficeAction: 'regularize_debt',
          }),
        );
      case 'support_expired':
        return Promise.resolve(
          this.result({
            status: VerificationStatus.EXPIRED,
            reasonCode: 'support_expired',
            userMessage:
              'Le support est expire. Le contrat peut continuer apres remplacement du support.',
            backOfficeAction: 'replace_support',
          }),
        );
      case 'payment_failure':
        return Promise.resolve(
          this.result({
            status: VerificationStatus.NOT_VERIFIED,
            reasonCode: 'payment_failure',
            userMessage: 'Le paiement n a pas pu etre valide.',
            backOfficeAction: 'retry_payment',
          }),
        );
      case 'contract_active':
      case 'support_compatible':
      case 'payment_success':
      default:
        return Promise.resolve(
          this.result({
            status: VerificationStatus.VERIFIED,
            reasonCode: scenario,
            userMessage: 'Verification interne confirmee.',
            backOfficeAction: 'continue_workflow',
          }),
        );
    }
  }

  private defaultScenario(type: InternalMobilityCheckType): string {
    switch (type) {
      case InternalMobilityCheckType.SUPPORT:
        return 'support_compatible';
      case InternalMobilityCheckType.PAYMENT:
        return 'payment_success';
      case InternalMobilityCheckType.DEBT:
        return 'no_debt';
      case InternalMobilityCheckType.CONTRACT:
        return 'contract_active';
    }
  }

  private result(
    params: Omit<VerificationResult, 'checkedAt' | 'source'>,
  ): VerificationResult {
    return {
      source: 'comutitres-internal.mock',
      checkedAt: MOCK_CHECKED_AT,
      ...params,
    };
  }
}
