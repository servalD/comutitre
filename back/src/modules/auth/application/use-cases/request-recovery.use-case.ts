import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IdentityStatus } from '../../../mobility/domain/enums/identity-status.enum';
import { MobilityIdentityRepository } from '../../../mobility/domain/mobility-identity.repository';
import { UserRepository } from '../../../users/domain/user.repository';
import {
  RequestRecoveryRequest,
  RequestRecoveryResponse,
} from '../dto/request-recovery.request';
import { RecoveryRequestRepository } from '../../infrastructure/recovery-request.repository';
import { normalizeLocalEmail } from '../local-email';
import { RecoverableIdentityLookupService } from '../services/recoverable-identity-lookup.service';

@Injectable()
export class RequestRecoveryUseCase {
  private readonly logger = new Logger(RequestRecoveryUseCase.name);

  constructor(
    private readonly recoverableLookup: RecoverableIdentityLookupService,
    private readonly mobilityIdentityRepository: MobilityIdentityRepository,
    private readonly userRepository: UserRepository,
    private readonly recoveryRequestRepository: RecoveryRequestRepository,
  ) {}

  async execute(
    params: RequestRecoveryRequest,
  ): Promise<RequestRecoveryResponse> {
    const email = normalizeLocalEmail(params.email);
    const existingUser = await this.userRepository.findLocalByEmail(email);
    if (existingUser) {
      throw new ConflictException('Cette adresse e-mail est déjà utilisée.');
    }

    const identity = await this.recoverableLookup.findRecoverable(
      params.firstName,
      params.lastName,
      new Date(params.birthDate),
    );
    if (!identity) {
      throw new NotFoundException(
        'Aucun profil mobilité récupérable trouvé pour ces informations.',
      );
    }

    const guardianEmail = await this.recoverableLookup.findLegalGuardianEmail(
      identity.id,
    );
    if (!guardianEmail) {
      throw new NotFoundException(
        'Aucun responsable légal avec adresse e-mail trouvé pour ce profil.',
      );
    }

    const passwordHash = await bcrypt.hash(params.password, 12);
    const verificationCode = String(
      Math.floor(100000 + Math.random() * 900000),
    );
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.recoveryRequestRepository.cancelPendingForIdentity(identity.id);
    await this.recoveryRequestRepository.create({
      mobilityIdentityId: identity.id,
      email,
      passwordHash,
      verificationCode,
      expiresAt,
    });

    await this.mobilityIdentityRepository.update(identity.id, {
      status: IdentityStatus.PENDING_RECOVERY,
    });

    const maskedGuardianEmail = this.recoverableLookup.maskEmail(guardianEmail);

    this.logger.log(
      `Recovery code for identity ${identity.id} sent to legal guardian ${guardianEmail} (new account ${email}): ${verificationCode}`,
    );

    const response: RequestRecoveryResponse = {
      message:
        'Un code de vérification a été envoyé à l’adresse e-mail de votre responsable légal.',
      maskedGuardianEmail,
    };

    if (process.env.NODE_ENV !== 'production') {
      response.devCode = verificationCode;
    }

    return response;
  }
}
