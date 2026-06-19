import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import {
  YousignClient,
  type YouSignVerificationResult,
} from '../../../../infrastructure/yousign/yousign.client';
import { ContractRepository } from '../../../contracts/domain/contract.repository';
import type { Contract } from '../../../contracts/domain/contract';
import {
  Justificatif,
  JustificatifStatus,
  JustificatifType,
  YOUSIGN_VERIFIED_TYPES,
} from '../../domain/justificatif';
import { ContractDocumentGateService } from '../services/contract-document-gate.service';
import { JustificatifAiVerificationService } from '../services/justificatif-ai-verification.service';
import { JustificatifRepository } from '../../domain/justificatif.repository';

const LOCKED_JUSTIFICATIF_STATUSES = new Set<JustificatifStatus>([
  JustificatifStatus.PRE_QUALIFIE,
  JustificatifStatus.ACCEPTE,
]);

const REPLACEABLE_JUSTIFICATIF_STATUSES = new Set<JustificatifStatus>([
  JustificatifStatus.A_REVOIR,
  JustificatifStatus.REFUSE,
  JustificatifStatus.INCOMPLET,
  JustificatifStatus.RECU,
  JustificatifStatus.EN_COURS_DE_VERIFICATION,
]);

@Injectable()
export class UploadJustificatifUseCase {
  private readonly logger = new Logger(UploadJustificatifUseCase.name);
  private readonly uploadsDir: string;

  constructor(
    private readonly justificatifRepo: JustificatifRepository,
    private readonly contractRepo: ContractRepository,
    private readonly yousign: YousignClient,
    private readonly aiVerification: JustificatifAiVerificationService,
    private readonly documentGate: ContractDocumentGateService,
  ) {
    this.uploadsDir = join(process.cwd(), 'uploads');
  }

  async execute(params: {
    userId: string;
    contractId: string;
    type: JustificatifType;
    fileBuffer: Buffer;
    originalFilename: string;
    mimeType: string;
    firstName?: string;
    lastName?: string;
  }): Promise<Justificatif> {
    const contract = await this.contractRepo.findById(params.contractId);
    if (!contract) throw new NotFoundException('Contrat introuvable');

    if (contract.userId !== params.userId) {
      throw new BadRequestException('Ce contrat ne vous appartient pas');
    }

    // Contrôle technique : taille (10 Mo max) et type MIME
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];
    if (!allowedMimes.includes(params.mimeType)) {
      throw new BadRequestException(
        'Format non supporté (PDF, JPEG ou PNG requis)',
      );
    }
    if (params.fileBuffer.length > 10 * 1024 * 1024) {
      throw new BadRequestException('Fichier trop volumineux (10 Mo max)');
    }

    if (YOUSIGN_VERIFIED_TYPES.has(params.type)) {
      const firstName = contract.holderFirstName?.trim() ?? '';
      const lastName = contract.holderLastName?.trim() ?? '';

      if (!firstName || !lastName) {
        throw new BadRequestException(
          'Prénom et nom du porteur requis sur le contrat pour la vérification YouSign',
        );
      }
    }

    // Persist file locally
    await mkdir(this.uploadsDir, { recursive: true });
    const ext = params.originalFilename.split('.').pop() ?? 'bin';
    const storedFilename = `${randomUUID()}.${ext}`;
    const filePath = join(this.uploadsDir, storedFilename);
    await writeFile(filePath, params.fileBuffer);

    const existing = await this.justificatifRepo.findByContractIdAndType(
      params.contractId,
      params.type,
    );

    if (existing && LOCKED_JUSTIFICATIF_STATUSES.has(existing.status)) {
      throw new ConflictException(
        'Un document de ce type est déjà déposé et en cours de traitement.',
      );
    }

    const now = new Date();
    let justificatif: Justificatif;

    if (existing && REPLACEABLE_JUSTIFICATIF_STATUSES.has(existing.status)) {
      justificatif = new Justificatif(
        existing.id,
        existing.contractId,
        existing.userId,
        existing.type,
        JustificatifStatus.RECU,
        filePath,
        params.originalFilename,
        null,
        null,
        [],
        null,
        null,
        null,
        null,
        existing.createdAt,
        now,
      );
    } else if (existing) {
      throw new ConflictException('Document déjà déposé pour ce type.');
    } else {
      justificatif = new Justificatif(
        randomUUID(),
        params.contractId,
        params.userId,
        params.type,
        JustificatifStatus.RECU,
        filePath,
        params.originalFilename,
        null,
        null,
        [],
        null,
        null,
        null,
        null,
        now,
        now,
      );
    }

    await this.justificatifRepo.save(justificatif);
    await this.runVerification(justificatif, contract, params);

    return justificatif;
  }

  private async runVerification(
    justificatif: Justificatif,
    contract: Contract,
    params: {
      type: JustificatifType;
      fileBuffer: Buffer;
      originalFilename: string;
      mimeType: string;
    },
  ): Promise<void> {
    if (YOUSIGN_VERIFIED_TYPES.has(params.type)) {
      const firstName = contract.holderFirstName.trim();
      const lastName = contract.holderLastName.trim();

      try {
        let result: YouSignVerificationResult;
        if (params.type === JustificatifType.PIECE_IDENTITE) {
          result = await this.yousign.createIdentityVerification(
            params.fileBuffer,
            params.originalFilename,
            { firstName, lastName },
          );
        } else {
          result = await this.yousign.createProofOfAddressVerification(
            params.fileBuffer,
            params.originalFilename,
            { firstName, lastName },
          );
        }

        if (!result.id.startsWith('sandbox-local-')) {
          justificatif.yousignVerificationId = result.id;
        }
        if (result.status === 'pending') {
          justificatif.status = JustificatifStatus.EN_COURS_DE_VERIFICATION;
        } else {
          justificatif.applyYousignResult(result.status, result.statusCodes);
        }
        await this.justificatifRepo.save(justificatif);
      } catch (err) {
        this.logger.warn(
          `YouSign verification rejected for ${justificatif.id}: ${String(err)}`,
        );
        justificatif.applyYousignResult('failed', ['IDDV_1103']);
        await this.justificatifRepo.save(justificatif);
      }
      await this.documentGate.tryAdvanceContract(justificatif.contractId);
      return;
    }

    justificatif.status = JustificatifStatus.EN_COURS_DE_VERIFICATION;
    await this.justificatifRepo.save(justificatif);

    const aiResult = await this.aiVerification.verify({
      type: params.type,
      fileBuffer: params.fileBuffer,
      mimeType: params.mimeType,
      originalFilename: params.originalFilename,
    });

    justificatif.status = aiResult.conforme
      ? JustificatifStatus.PRE_QUALIFIE
      : JustificatifStatus.A_REVOIR;
    justificatif.agentMotif = aiResult.motif;
    await this.justificatifRepo.save(justificatif);
    await this.documentGate.tryAdvanceContract(justificatif.contractId);
  }
}
