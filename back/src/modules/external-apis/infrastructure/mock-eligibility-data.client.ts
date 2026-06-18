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
    const paramMatch = this.tryParamMatch(input);
    if (paramMatch) {
      return Promise.resolve(paramMatch);
    }

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

  private tryParamMatch(
    input: EligibilityCheckInput,
  ): VerificationResult | null {
    const { type } = input;

    if (type === EligibilityCheckType.FAMILY_QUOTIENT) {
      const { numeroAllocataire, codePostal } = input;
      if (numeroAllocataire || codePostal) {
        if (numeroAllocataire === '2345678' && codePostal === '75001') {
          return this.result({
            status: VerificationStatus.VERIFIED,
            reasonCode: 'family_quotient_confirmed',
            userMessage: 'Quotient familial confirme (1234 €).',
            backOfficeAction: 'auto_validate_right',
            expiresAt: '2026-08-31',
            rawPayload: {
              quotientFamilial: 1234,
              mois: 7,
              annee: 2022,
              allocataires: [
                {
                  nomPrenom: 'MARIE DUPONT',
                  dateDeNaissance: '01031988',
                  sexe: 'F',
                },
                {
                  nomPrenom: 'JEAN DUPONT',
                  dateDeNaissance: '01041990',
                  sexe: 'M',
                },
              ],
              enfants: [
                {
                  nomPrenom: 'JACQUES DUPONT',
                  dateDeNaissance: '01012010',
                  sexe: 'M',
                },
                {
                  nomPrenom: 'JEANNE DUPONT',
                  dateDeNaissance: '01022012',
                  sexe: 'F',
                },
              ],
              adresse: {
                identite: 'Monsieur JEAN DUPONT',
                complementIdentite: 'APPARTEMENT 51',
                complementIdentiteGeo: 'RESIDENCE DES COLOMBES',
                numeroRue: '42 RUE DE LA PAIX',
                lieuDit: 'ILOTS DES OISEAUX',
                codePostalVille: '75001 PARIS',
                pays: 'FRANCE',
              },
            },
          });
        }
        if (numeroAllocataire === '4400100' && codePostal === '44100') {
          return this.result({
            status: VerificationStatus.VERIFIED,
            reasonCode: 'family_quotient_confirmed',
            userMessage: 'Quotient familial confirme (600 €).',
            backOfficeAction: 'auto_validate_right',
            expiresAt: '2026-08-31',
            rawPayload: {
              quotientFamilial: 600,
              mois: 7,
              annee: 2023,
              allocataires: [
                {
                  nomPrenom: 'DUPONT JEAN',
                  dateDeNaissance: '25021969',
                  sexe: 'M',
                },
                {
                  nomPrenom: 'DUPONT JEANNE',
                  dateDeNaissance: '25021969',
                  sexe: 'F',
                },
              ],
              enfants: [
                {
                  nomPrenom: 'DUPONT THOMAS',
                  dateDeNaissance: '05052005',
                  sexe: 'M',
                },
                {
                  nomPrenom: 'DUPONT HUGO',
                  dateDeNaissance: '05052005',
                  sexe: 'M',
                },
              ],
              adresse: {
                identite: 'Monsieur JEAN DUPONT',
                complementIdentite: 'APPARTEMENT 51',
                complementIdentiteGeo: 'RESIDENCE DES COLOMBES',
                numeroRue: '42 RUE DE LA PAIX',
                lieuDit: 'ILOTS DES OISEAUX',
                codePostalVille: '44000 NANTES',
                pays: 'FRANCE',
              },
            },
          });
        }
        if (numeroAllocataire?.startsWith('404')) {
          return this.result({
            status: VerificationStatus.REJECTED,
            reasonCode: 'family_quotient_rejected',
            userMessage: 'Aucun allocataire trouve avec ce numero.',
            backOfficeAction: 'manual_review',
            rawPayload: { error: 'not_found' },
          });
        }
        if (
          numeroAllocataire?.startsWith('500') ||
          numeroAllocataire?.startsWith('503')
        ) {
          return this.result({
            status: VerificationStatus.NEEDS_DOCUMENT,
            reasonCode: 'family_quotient_unavailable',
            userMessage:
              'La verification automatique du quotient familial est indisponible. Un justificatif est requis.',
            backOfficeAction: 'request_manual_certificate',
            rawPayload: { error: 'service_unavailable', code: 503 },
          });
        }
      }
    }

    if (
      type === EligibilityCheckType.STUDENT_SCHOLARSHIP ||
      type === EligibilityCheckType.STUDENT
    ) {
      const { ine, nom, prenom, sexe, dateNaissance } = input;
      if (ine || nom || prenom || sexe || dateNaissance) {
        if (ine === '1234567890A') {
          return this.result({
            status: VerificationStatus.VERIFIED,
            reasonCode: 'student_scholarship_confirmed',
            userMessage: 'Statut boursier etudiant confirme (Echelon 6).',
            backOfficeAction: 'auto_validate_right',
            expiresAt: '2026-08-31',
            rawPayload: {
              nom: 'Durand',
              prenom: 'Géraldine',
              prenom2: '',
              dateNaissance: '1990-01-01',
              lieuNaissance: 'Paris',
              sexe: 'F',
              boursier: true,
              echelonBourse: '6',
              email: 'geraldine.durand@gmail.com',
              dateDeRentree: '2024-09-01',
              statutLibelle: 'définitif',
              etablissement: 'Universite Paris Cite',
            },
          });
        }
        if (ine === '1234567890B') {
          return this.result({
            status: VerificationStatus.EXPIRED,
            reasonCode: 'student_scholarship_expired',
            userMessage: 'Le droit verifie automatiquement est expire.',
            backOfficeAction: 'request_updated_document',
            rawPayload: { statutLibelle: 'expiré' },
          });
        }
        if (ine === '1234567404G') {
          return this.result({
            status: VerificationStatus.REJECTED,
            reasonCode: 'student_status_unavailable',
            userMessage: 'Dossier non trouve pour cet INE.',
            backOfficeAction: 'manual_review',
            rawPayload: { error: 'not_found' },
          });
        }
        if (
          nom?.toLowerCase() === 'pagnol' &&
          prenom?.toLowerCase() === 'marcel'
        ) {
          return this.result({
            status: VerificationStatus.VERIFIED,
            reasonCode: 'student_scholarship_confirmed',
            userMessage: 'Statut boursier etudiant confirme (Echelon 5).',
            backOfficeAction: 'auto_validate_right',
            expiresAt: '2026-08-31',
            rawPayload: {
              nom: 'Pagnol',
              prenom: 'Marcel',
              prenom2: '',
              dateNaissance: '1998-07-12',
              lieuNaissance: 'Paris',
              sexe: 'M',
              boursier: true,
              echelonBourse: '5',
              email: 'marcel@pagnol.fr',
              dateDeRentree: '2024-09-01',
              statutLibelle: 'définitif',
              villeEtudes: 'Evry',
              etablissement: 'ENSIIE',
            },
          });
        }
      }
    }

    if (type === EligibilityCheckType.SCHOOL_STUDENT) {
      const { nom, prenom, dateNaissance } = input;
      if (nom || prenom || dateNaissance) {
        if (
          nom?.toLowerCase() === 'martin' &&
          prenom?.toLowerCase() === 'justine' &&
          dateNaissance === '2000-01-20'
        ) {
          return this.result({
            status: VerificationStatus.VERIFIED,
            reasonCode: 'school_student_confirmed',
            userMessage: 'Statut scolaire boursier confirme.',
            backOfficeAction: 'auto_validate_right',
            expiresAt: '2026-08-31',
            rawPayload: {
              eleve: {
                nom: 'Martin',
                prenom: 'Justine',
                sexe: 'F',
                date_naissance: '2000-01-20',
              },
              code_etablissement: '0890003V',
              annee_scolaire: '2022-2023',
              est_scolarise: true,
              est_boursier: true,
              status_eleve: {
                code: 'ST',
                libelle: 'Scolaire',
              },
            },
          });
        }
        if (
          nom?.toLowerCase() === 'martin' &&
          prenom?.toLowerCase() === 'jerome'
        ) {
          return this.result({
            status: VerificationStatus.REJECTED,
            reasonCode: 'school_student_rejected',
            userMessage: 'Eleve non trouve pour les critères saisis.',
            backOfficeAction: 'manual_review',
            rawPayload: { error: 'not_found', message: 'Eleve non trouve' },
          });
        }
      }
    }

    if (type === EligibilityCheckType.TAX) {
      const { numeroFiscal, referenceAvis } = input;
      if (numeroFiscal || referenceAvis) {
        if (numeroFiscal === '1234567890123') {
          return this.result({
            status: VerificationStatus.VERIFIED,
            reasonCode: 'tax_confirmed',
            userMessage: "Avis d'impot confirme.",
            backOfficeAction: 'auto_validate_right',
            expiresAt: '2026-08-31',
            rawPayload: {
              numeroFiscal: '1234567890123',
              nomFamille: 'DUPONT',
              prenom: 'JEAN',
              dateNaissance: '1990-04-15',
              revenuFiscalReference: 24500,
              nombreParts: 1,
              situationFamille: 'Célibataire',
            },
          });
        }
      }
    }

    return null;
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
