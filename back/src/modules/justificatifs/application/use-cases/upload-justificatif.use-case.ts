import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { Env } from '../../../../infrastructure/config/env.validation';
import {
  YousignClient,
  type YouSignVerificationResult,
} from '../../../../infrastructure/yousign/yousign.client';
import { ContractRepository } from '../../../contracts/domain/contract.repository';
import {
  Justificatif,
  JustificatifStatus,
  JustificatifType,
  YOUSIGN_VERIFIED_TYPES,
} from '../../domain/justificatif';
import { JustificatifRepository } from '../../domain/justificatif.repository';

@Injectable()
export class UploadJustificatifUseCase {
  private readonly logger = new Logger(UploadJustificatifUseCase.name);
  private readonly uploadsDir: string;

  constructor(
    private readonly justificatifRepo: JustificatifRepository,
    private readonly contractRepo: ContractRepository,
    private readonly yousign: YousignClient,
    private readonly config: ConfigService<Env, true>,
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

    const justificatif = new Justificatif(
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
      new Date(),
      new Date(),
    );

    await this.justificatifRepo.save(justificatif);

    // Launch YouSign Document Verification for supported types
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

        justificatif.yousignVerificationId = result.id;
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
        // Document non reconnu / invalide — pas de passage silencieux en revue agent
        justificatif.applyYousignResult('failed', ['IDDV_1103']);
        await this.justificatifRepo.save(justificatif);
      }
    } else {
      // Document handled manually by an agent
      justificatif.status = JustificatifStatus.EN_COURS_DE_VERIFICATION;
      await this.justificatifRepo.save(justificatif);
    }

    return justificatif;
  }
}
