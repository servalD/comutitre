import { randomUUID } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from '../config/env.validation';

/** Basenames reconnus par YouSign sandbox (sans extension). */
const IDENTITY_SANDBOX_BASENAMES = new Set([
  'pending_id_document_verification',
  'verified_id_document_verification',
  'verified_anonymized_id_document_verification',
  'verified_anonymised_id_document_verification',
  'failed_id_document_verification',
  'failed_anonymized_id_document_verification',
  'failed_anonymised_id_document_verification',
  'inconclusive_id_document_verification',
  'inconclusive_anonymized_id_document_verification',
  'inconclusive_anonymised_id_document_verification',
]);

const PROOF_OF_ADDRESS_SANDBOX_BASENAMES = new Set([
  'pending_proof_of_address_verification',
  'verified_proof_of_address_verification',
  'verified_anonymized_proof_of_address_verification',
  'verified_anonymised_proof_of_address_verification',
  'failed_proof_of_address_verification',
  'failed_anonymized_proof_of_address_verification',
  'failed_anonymised_proof_of_address_verification',
  'inconclusive_proof_of_address_verification',
  'inconclusive_anonymized_proof_of_address_verification',
  'inconclusive_anonymised_proof_of_address_verification',
]);

export interface YouSignVerificationResult {
  id: string;
  status: 'pending' | 'verified' | 'failed' | 'inconclusive' | 'done';
  statusCodes: string[];
}

export interface YouSignSigner {
  id: string;
  status: string;
  signatureLink: string | null;
}

export interface YouSignSignatureRequestResult {
  id: string;
  status: string;
  signers: YouSignSigner[];
}

@Injectable()
export class YousignClient {
  private readonly logger = new Logger(YousignClient.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly deliveryMode: string;

  constructor(private readonly config: ConfigService<Env, true>) {
    this.baseUrl = this.config.get('YOUSIGN_BASE_URL', { infer: true });
    this.apiKey = this.config.get('YOUSIGN_API_KEY', { infer: true });
    this.deliveryMode = this.config.get('YOUSIGN_DELIVERY_MODE', {
      infer: true,
    });
  }

  private jsonHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  private isSandbox(): boolean {
    return this.baseUrl.includes('sandbox');
  }

  /**
   * En sandbox YouSign, le résultat simulé dépend du nom du fichier envoyé
   * (ex. verified_id_document_verification.pdf). En production, le nom réel est utilisé.
   */
  private verificationFilename(originalFilename: string): string {
    const basename = originalFilename.split(/[/\\]/).pop() ?? 'document.pdf';
    const sanitized = basename.replace(/[^\w.-]/g, '_');
    return sanitized.length > 0 ? sanitized : 'document.pdf';
  }

  private basenameWithoutExtension(filename: string): string {
    const base = filename.split(/[/\\]/).pop() ?? filename;
    const dot = base.lastIndexOf('.');
    return (dot > 0 ? base.slice(0, dot) : base).toLowerCase();
  }

  /**
   * Sandbox : seuls les noms de fichiers documentés par YouSign déclenchent une simulation.
   * Tout autre nom est refusé localement (comportement attendu côté YouSign).
   */
  private rejectUnrecognizedSandboxFilename(
    uploadName: string,
    allowedBasenames: Set<string>,
  ): YouSignVerificationResult | null {
    if (!this.isSandbox()) return null;

    const basename = this.basenameWithoutExtension(uploadName);
    if (allowedBasenames.has(basename)) return null;

    this.logger.warn(
      `YouSign sandbox: filename "${uploadName}" not recognized — rejecting as failed (use verified_*_verification.* to simulate success)`,
    );
    return {
      id: `sandbox-local-${randomUUID()}`,
      status: 'failed',
      statusCodes: ['IDDV_1103'],
    };
  }

  private isLocalSandboxResult(id: string): boolean {
    return id.startsWith('sandbox-local-');
  }

  private async postVerification(
    path: string,
    fileBuffer: Buffer,
    filename: string,
    params: { firstName: string; lastName: string },
    allowedSandboxBasenames: Set<string>,
  ): Promise<YouSignVerificationResult> {
    const uploadName = this.verificationFilename(filename);
    const sandboxReject = this.rejectUnrecognizedSandboxFilename(
      uploadName,
      allowedSandboxBasenames,
    );
    if (sandboxReject) return sandboxReject;

    const form = new FormData();
    form.append('file', new Blob([new Uint8Array(fileBuffer)]), uploadName);
    if (params.firstName) form.append('first_name', params.firstName);
    if (params.lastName) form.append('last_name', params.lastName);

    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: form,
    });

    if (!res.ok) {
      const body = await res.text();
      this.logger.error(
        `YouSign verification failed (${path}): ${res.status} ${body} [filename=${uploadName}, sandbox=${this.isSandbox()}]`,
      );
      throw new Error(`YouSign verification failed: ${res.status}`);
    }

    const data = (await res.json()) as {
      id: string;
      status: string;
      status_codes?: string[];
    };
    this.logger.log(
      `YouSign verification created id=${data.id} status=${data.status} file=${uploadName}`,
    );
    return {
      id: data.id,
      status: data.status as YouSignVerificationResult['status'],
      statusCodes: data.status_codes ?? [],
    };
  }

  async createIdentityVerification(
    fileBuffer: Buffer,
    filename: string,
    params: { firstName: string; lastName: string },
  ): Promise<YouSignVerificationResult> {
    return this.postVerification(
      '/verifications/identity_documents',
      fileBuffer,
      filename,
      params,
      IDENTITY_SANDBOX_BASENAMES,
    );
  }

  async createProofOfAddressVerification(
    fileBuffer: Buffer,
    filename: string,
    params: { firstName: string; lastName: string },
  ): Promise<YouSignVerificationResult> {
    return this.postVerification(
      '/verifications/proof_of_address',
      fileBuffer,
      filename,
      params,
      PROOF_OF_ADDRESS_SANDBOX_BASENAMES,
    );
  }

  async getIdentityDocumentVerification(
    verificationId: string,
  ): Promise<YouSignVerificationResult> {
    if (this.isLocalSandboxResult(verificationId)) {
      throw new Error('Local sandbox verification is terminal');
    }
    const res = await fetch(
      `${this.baseUrl}/verifications/identity_documents/${verificationId}`,
      { headers: this.jsonHeaders() },
    );
    if (!res.ok) {
      throw new Error(
        `YouSign getIdentityDocumentVerification failed: ${res.status}`,
      );
    }
    const data = (await res.json()) as {
      id: string;
      status: string;
      status_codes?: string[];
    };
    return this.parseVerificationResponse(data);
  }

  async getProofOfAddressVerification(
    verificationId: string,
  ): Promise<YouSignVerificationResult> {
    if (this.isLocalSandboxResult(verificationId)) {
      throw new Error('Local sandbox verification is terminal');
    }
    const res = await fetch(
      `${this.baseUrl}/verifications/proof_of_address/${verificationId}`,
      { headers: this.jsonHeaders() },
    );
    if (!res.ok) {
      throw new Error(
        `YouSign getProofOfAddressVerification failed: ${res.status}`,
      );
    }
    const data = (await res.json()) as {
      id: string;
      status: string;
      status_codes?: string[];
    };
    return this.parseVerificationResponse(data);
  }

  /** @deprecated Use getIdentityDocumentVerification or getProofOfAddressVerification */
  async getVerification(
    verificationId: string,
  ): Promise<YouSignVerificationResult> {
    return this.getIdentityDocumentVerification(verificationId);
  }

  private parseVerificationResponse(data: {
    id: string;
    status: string;
    status_codes?: string[];
  }): YouSignVerificationResult {
    return {
      id: data.id,
      status: data.status as YouSignVerificationResult['status'],
      statusCodes: data.status_codes ?? [],
    };
  }

  /** Full flow: create → upload doc → add signer(s) → activate. */
  async createAndActivateSignatureRequest(params: {
    name: string;
    externalId: string;
    pdfBuffer: Buffer;
    pdfFilename: string;
    signers: Array<{
      firstName: string;
      lastName: string;
      email: string;
    }>;
  }): Promise<YouSignSignatureRequestResult> {
    // 1. Create signature request
    const srRes = await fetch(`${this.baseUrl}/signature_requests`, {
      method: 'POST',
      headers: this.jsonHeaders(),
      body: JSON.stringify({
        name: params.name,
        delivery_mode: this.deliveryMode,
        external_id: params.externalId,
      }),
    });
    if (!srRes.ok) {
      const body = await srRes.text();
      throw new Error(
        `YouSign createSignatureRequest failed: ${srRes.status} ${body}`,
      );
    }
    const sr = (await srRes.json()) as { id: string };

    // 2. Upload PDF document
    const docForm = new FormData();
    docForm.append(
      'file',
      new Blob([new Uint8Array(params.pdfBuffer)], { type: 'application/pdf' }),
      params.pdfFilename,
    );
    docForm.append('nature', 'signable_document');

    const docRes = await fetch(
      `${this.baseUrl}/signature_requests/${sr.id}/documents`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}` },
        body: docForm,
      },
    );
    if (!docRes.ok) {
      const body = await docRes.text();
      throw new Error(
        `YouSign uploadDocument failed: ${docRes.status} ${body}`,
      );
    }
    const doc = (await docRes.json()) as { id: string };

    // 3. Add signers with signature fields
    for (const signer of params.signers) {
      const signerRes = await fetch(
        `${this.baseUrl}/signature_requests/${sr.id}/signers`,
        {
          method: 'POST',
          headers: this.jsonHeaders(),
          body: JSON.stringify({
            info: {
              first_name: signer.firstName,
              last_name: signer.lastName,
              email: signer.email,
              locale: 'fr',
            },
            signature_level: 'electronic_signature',
            signature_authentication_mode: 'no_otp',
            fields: [
              {
                type: 'signature',
                document_id: doc.id,
                page: 1,
                x: 77,
                y: 655,
                width: 130,
                height: 58,
              },
            ],
          }),
        },
      );
      if (!signerRes.ok) {
        const body = await signerRes.text();
        throw new Error(
          `YouSign addSigner failed: ${signerRes.status} ${body}`,
        );
      }
    }

    // 4. Activate
    const activateRes = await fetch(
      `${this.baseUrl}/signature_requests/${sr.id}/activate`,
      {
        method: 'POST',
        headers: this.jsonHeaders(),
      },
    );
    if (!activateRes.ok) {
      const body = await activateRes.text();
      throw new Error(`YouSign activate failed: ${activateRes.status} ${body}`);
    }

    const activated = (await activateRes.json()) as {
      id: string;
      status: string;
      signers: Array<{
        id: string;
        status: string;
        signature_link: string | null;
      }>;
    };

    return {
      id: activated.id,
      status: activated.status,
      signers: (activated.signers ?? []).map((s) => ({
        id: s.id,
        status: s.status,
        signatureLink: s.signature_link ?? null,
      })),
    };
  }

  async getSignatureRequest(
    signatureRequestId: string,
  ): Promise<YouSignSignatureRequestResult> {
    const res = await fetch(
      `${this.baseUrl}/signature_requests/${signatureRequestId}`,
      { headers: this.jsonHeaders() },
    );
    if (!res.ok) {
      throw new Error(`YouSign getSignatureRequest failed: ${res.status}`);
    }

    const data = (await res.json()) as {
      id: string;
      status: string;
      signers: Array<{
        id: string;
        status: string;
        signature_link?: string | null;
      }>;
    };
    return {
      id: data.id,
      status: data.status,
      signers: (data.signers ?? []).map((s) => ({
        id: s.id,
        status: s.status,
        signatureLink: s.signature_link ?? null,
      })),
    };
  }
}
