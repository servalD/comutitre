import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { createHmac, timingSafeEqual } from 'crypto';
import { randomUUID } from 'crypto';
import type { Request } from 'express';
import { Env } from '../../../infrastructure/config/env.validation';
import { Public } from '../../../shared/decorators/public.decorator';
import { ActorRole, ContractStatus } from '../../contracts/domain/contract';
import { CgvuAcceptance } from '../../contracts/domain/cgvu-acceptance';
import { CgvuAcceptanceRepository } from '../../contracts/domain/cgvu-acceptance.repository';
import { ContractRepository } from '../../contracts/domain/contract.repository';
import { JustificatifRepository } from '../../justificatifs/domain/justificatif.repository';

interface YouSignVerificationResource {
  id: string;
  status: string;
  status_codes?: string[];
}

interface YouSignWebhookPayload {
  event_id: string;
  event_name: string;
  event_time: string;
  data: {
    signature_request?: {
      id: string;
      status: string;
      external_id?: string;
    };
    /** Legacy payload shape (pre-redesign). */
    verification?: YouSignVerificationResource;
    /** YouSign API v3 — identity document verification. */
    identity_document?: YouSignVerificationResource;
    /** YouSign API v3 — proof of address verification. */
    proof_of_address?: YouSignVerificationResource;
  };
}

@ApiTags('webhooks')
@Controller('webhooks')
export class YousignWebhookController {
  private readonly logger = new Logger(YousignWebhookController.name);
  private readonly processedEvents = new Set<string>();

  constructor(
    private readonly contractRepo: ContractRepository,
    private readonly cgvuRepo: CgvuAcceptanceRepository,
    private readonly justificatifRepo: JustificatifRepository,
    private readonly config: ConfigService<Env, true>,
  ) {}

  @Post('yousign')
  @Public()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Webhook YouSign (signature + verification events)',
  })
  handleYousignWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-yousign-signature-256') signature: string,
  ): { received: boolean } {
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    this.verifySignature(rawBody, signature);

    const payload = JSON.parse(rawBody.toString()) as YouSignWebhookPayload;

    // Idempotency: skip already processed events
    if (this.processedEvents.has(payload.event_id)) {
      return { received: true };
    }
    this.processedEvents.add(payload.event_id);

    this.logger.log(
      `YouSign webhook received: event="${payload.event_name}" id="${payload.event_id}"`,
    );

    // Process asynchronously so we respond < 1s
    setImmediate(() => {
      void this.dispatch(payload).catch((err: unknown) => {
        this.logger.error(`YouSign webhook handler failed: ${String(err)}`);
      });
    });

    return { received: true };
  }

  private verifySignature(rawBody: Buffer, signature: string): void {
    const secret = this.config.get('YOUSIGN_WEBHOOK_SECRET', { infer: true });
    if (!secret) return;

    if (!signature) {
      // YouSign only sends the header when a secret is configured on their side
      this.logger.warn(
        'YouSign webhook received without x-yousign-signature-256 header — skipping HMAC check. ' +
          'Make sure the webhook secret is configured in the YouSign sandbox dashboard.',
      );
      return;
    }

    const expected =
      'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex');

    try {
      if (
        signature.length !== expected.length ||
        !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
      ) {
        this.logger.error(
          `YouSign signature mismatch. Received: ${signature} | Expected: ${expected}`,
        );
        throw new BadRequestException('Invalid YouSign webhook signature');
      }
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException('Invalid YouSign webhook signature');
    }
  }

  private async dispatch(payload: YouSignWebhookPayload): Promise<void> {
    this.logger.log(`YouSign event: ${payload.event_name}`);

    switch (payload.event_name) {
      case 'signature_request.done':
        await this.handleSignatureRequestDone(payload);
        break;

      case 'signer.done':
        // Handled by signature_request.done when all signers are done
        break;

      case 'signature_request.declined':
        await this.handleSignatureDeclined(payload);
        break;

      case 'verification.identity_document.done':
      case 'verification.proof_of_address.done':
      case 'identity_document_verification.done':
      case 'identity_verification.done':
      case 'proof_of_address_verification.done':
        await this.handleVerificationDone(payload);
        break;

      case 'verification.identity_document.failed':
      case 'verification.proof_of_address.failed':
      case 'identity_document_verification.failed':
      case 'identity_verification.failed':
      case 'proof_of_address_verification.failed':
        await this.handleVerificationFailed(payload);
        break;

      default:
        this.logger.debug(`Unhandled YouSign event: ${payload.event_name}`);
    }
  }

  private async handleSignatureRequestDone(
    payload: YouSignWebhookPayload,
  ): Promise<void> {
    const srId = payload.data.signature_request?.id;
    if (!srId) return;

    const contract =
      await this.contractRepo.findByYousignSignatureRequestId(srId);
    if (!contract) {
      this.logger.warn(`No contract found for signature_request ${srId}`);
      return;
    }

    // Record CGVU acceptance (traçabilité §14.3)
    const acceptance = new CgvuAcceptance(
      randomUUID(),
      contract.id,
      contract.cgvuVersion,
      null,
      contract.userId,
      ActorRole.HOLDER,
      'web',
      srId,
      new Date(payload.event_time),
      new Date(),
    );
    await this.cgvuRepo.save(acceptance);

    contract.activate();
    await this.contractRepo.save(contract);

    this.logger.log(
      `Contract ${contract.id} activated after YouSign signature_request.done`,
    );
  }

  private async handleSignatureDeclined(
    payload: YouSignWebhookPayload,
  ): Promise<void> {
    const srId = payload.data.signature_request?.id;
    if (!srId) return;

    const contract =
      await this.contractRepo.findByYousignSignatureRequestId(srId);
    if (!contract) return;

    contract.status = ContractStatus.EN_ATTENTE_DE_SIGNATURE_PAYEUR;
    await this.contractRepo.save(contract);
    this.logger.log(
      `Contract ${contract.id} signature declined — reverted to en_attente_de_signature_payeur`,
    );
  }

  private extractVerification(
    payload: YouSignWebhookPayload,
  ): YouSignVerificationResource | null {
    const { data } = payload;
    return (
      data.identity_document ??
      data.proof_of_address ??
      data.verification ??
      null
    );
  }

  private async handleVerificationDone(
    payload: YouSignWebhookPayload,
  ): Promise<void> {
    const verification = this.extractVerification(payload);
    if (!verification?.id) {
      this.logger.warn(
        `YouSign verification webhook without resource id (event=${payload.event_name})`,
      );
      return;
    }

    const justificatif =
      await this.justificatifRepo.findByYousignVerificationId(verification.id);
    if (!justificatif) {
      this.logger.warn(`No justificatif for verification ${verification.id}`);
      return;
    }

    justificatif.applyYousignResult(
      verification.status,
      verification.status_codes ?? [],
    );
    await this.justificatifRepo.save(justificatif);
    this.logger.log(
      `Justificatif ${justificatif.id} → ${justificatif.status} (YouSign: ${verification.status})`,
    );
  }

  private async handleVerificationFailed(
    payload: YouSignWebhookPayload,
  ): Promise<void> {
    const verification = this.extractVerification(payload);
    if (!verification?.id) return;

    const justificatif =
      await this.justificatifRepo.findByYousignVerificationId(verification.id);
    if (!justificatif) return;

    justificatif.applyYousignResult(
      verification.status || 'failed',
      verification.status_codes ?? [],
    );
    await this.justificatifRepo.save(justificatif);
    this.logger.log(
      `Justificatif ${justificatif.id} → ${justificatif.status} (YouSign failed)`,
    );
  }
}
