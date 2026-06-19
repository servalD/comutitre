import { Injectable, Logger } from '@nestjs/common';
import { MistralClient } from '../../../rag/infrastructure/mistral.client';
import { JustificatifType } from '../../domain/justificatif';

const TYPE_PROMPTS: Partial<Record<JustificatifType, string>> = {
  [JustificatifType.CERTIFICAT_SCOLARITE]: `Tu es un agent de contrôle documentaire pour Comutitres.
Analyse cette image/PDF et détermine s'il s'agit d'un certificat ou attestation de scolarité lisible (établissement, année scolaire, nom d'élève).
Réponds UNIQUEMENT en JSON : {"conforme": boolean, "motif": "explication courte en français"}`,

  [JustificatifType.PHOTO]: `Tu es un agent de contrôle documentaire pour Comutitres.
Analyse cette image et détermine s'il s'agit d'une photo d'identité conforme (visage visible, fond neutre ou clair, pas un paysage/objet).
Réponds UNIQUEMENT en JSON : {"conforme": boolean, "motif": "explication courte en français"}`,

  [JustificatifType.ATTESTATION_BOURSE]: `Tu es un agent de contrôle documentaire pour Comutitres.
Analyse ce document et détermine s'il s'agit d'une attestation de bourse ou notification de boursier.
Réponds UNIQUEMENT en JSON : {"conforme": boolean, "motif": "explication courte en français"}`,

  [JustificatifType.MANDAT_SEPA]: `Tu es un agent de contrôle documentaire pour Comutitres.
Analyse ce document et détermine s'il s'agit d'un mandat SEPA ou autorisation de prélèvement.
Réponds UNIQUEMENT en JSON : {"conforme": boolean, "motif": "explication courte en français"}`,

  [JustificatifType.ATTESTATION_CAF]: `Tu es un agent de contrôle documentaire pour Comutitres.
Analyse ce document et détermine s'il s'agit d'une attestation CAF, RSA ou droit social transport.
Réponds UNIQUEMENT en JSON : {"conforme": boolean, "motif": "explication courte en français"}`,

  [JustificatifType.AUTRE]: `Tu es un agent de contrôle documentaire pour Comutitres.
Analyse ce document et détermine s'il est lisible et exploitable comme justificatif administratif.
Réponds UNIQUEMENT en JSON : {"conforme": boolean, "motif": "explication courte en français"}`,
};

const IMAGE_MIMES = new Set(['image/jpeg', 'image/jpg', 'image/png']);

@Injectable()
export class JustificatifAiVerificationService {
  private readonly logger = new Logger(JustificatifAiVerificationService.name);

  constructor(private readonly mistral: MistralClient) {}

  async verify(params: {
    type: JustificatifType;
    fileBuffer: Buffer;
    mimeType: string;
    originalFilename: string;
  }): Promise<{ conforme: boolean; motif: string }> {
    if (!this.mistral.hasKey) {
      this.logger.warn(
        `MISTRAL_API_KEY missing — auto pre-qualifying ${params.type} (${params.originalFilename})`,
      );
      return {
        conforme: true,
        motif: 'Pré-qualifié automatiquement (mode démo sans clé Mistral).',
      };
    }

    if (params.mimeType === 'application/pdf') {
      this.logger.warn(
        `PDF AI verification skipped for ${params.type} — pre-qualifying for demo (${params.originalFilename})`,
      );
      return {
        conforme: true,
        motif:
          'Document PDF reçu — pré-qualifié en mode démo (analyse vision sur image recommandée).',
      };
    }

    if (!IMAGE_MIMES.has(params.mimeType)) {
      return {
        conforme: false,
        motif: 'Format non supporté pour la vérification automatique.',
      };
    }

    const prompt =
      TYPE_PROMPTS[params.type] ??
      `Analyse ce document justificatif. Réponds UNIQUEMENT en JSON : {"conforme": boolean, "motif": "explication courte en français"}`;

    try {
      const result = await this.mistral.analyzeDocumentImage(
        params.fileBuffer,
        params.mimeType,
        prompt,
      );
      this.logger.log(
        `AI verification ${params.type} (${params.originalFilename}): conforme=${result.conforme}`,
      );
      return result;
    } catch (err) {
      this.logger.warn(
        `AI verification failed for ${params.type}: ${String(err)}`,
      );
      return {
        conforme: true,
        motif: 'Pré-qualifié — analyse IA indisponible (mode démo).',
      };
    }
  }
}
