import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { IdentityStatus } from '../../../mobility/domain/enums/identity-status.enum';
import { RelationshipType } from '../../../mobility/domain/enums/relationship-type.enum';
import { MobilityIdentityRepository } from '../../../mobility/domain/mobility-identity.repository';
import { RelationshipRepository } from '../../../mobility/domain/relationship.repository';
import { DefaultPermissionsService } from '../../../mobility/application/services/default-permissions.service';
import { TimelineRecorderService } from '../../../mobility/application/services/timeline-recorder.service';
import { UserRepository } from '../../../users/domain/user.repository';
import { AuthProvider } from '../../../users/domain/user';
import { AppJwtService } from '../../infrastructure/app-jwt.service';
import { RecoveryRequestRepository } from '../../infrastructure/recovery-request.repository';
import { CompleteRecoveryRequest } from '../dto/complete-recovery.request';
import { RegisterResult } from './register.use-case';
import { normalizeLocalEmail } from '../local-email';

@Injectable()
export class CompleteRecoveryUseCase {
  private readonly logger = new Logger(CompleteRecoveryUseCase.name);

  constructor(
    private readonly recoveryRequestRepository: RecoveryRequestRepository,
    private readonly userRepository: UserRepository,
    private readonly mobilityIdentityRepository: MobilityIdentityRepository,
    private readonly relationshipRepository: RelationshipRepository,
    private readonly defaultPermissions: DefaultPermissionsService,
    private readonly timelineRecorder: TimelineRecorderService,
    private readonly appJwtService: AppJwtService,
  ) {}

  async execute(params: CompleteRecoveryRequest): Promise<RegisterResult> {
    const email = normalizeLocalEmail(params.email);
    const request =
      await this.recoveryRequestRepository.findPendingByEmailAndCode(
        email,
        params.code,
      );

    if (!request || request.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Code invalide ou expiré.');
    }

    const existingUser = await this.userRepository.findLocalByEmail(email);
    if (existingUser) {
      throw new ConflictException('Cette adresse e-mail est déjà utilisée.');
    }

    const identity = await this.mobilityIdentityRepository.findById(
      request.mobilityIdentityId,
    );
    if (!identity) {
      throw new UnauthorizedException('Profil mobilité introuvable.');
    }

    const hasOwner = await this.relationshipRepository.hasActiveOwner(
      identity.id,
    );
    if (hasOwner) {
      throw new ConflictException('Ce profil a déjà été récupéré.');
    }

    const user = await this.userRepository.createLocal({
      firstName: identity.firstName,
      lastName: identity.lastName,
      email,
      passwordHash: request.passwordHash,
    });

    await this.relationshipRepository.create({
      accountId: user.id,
      mobilityIdentityId: identity.id,
      relationshipType: RelationshipType.OWNER,
      permissions: this.defaultPermissions.forType(RelationshipType.OWNER),
    });

    await this.mobilityIdentityRepository.update(identity.id, {
      status: IdentityStatus.ACTIVE,
    });

    await this.recoveryRequestRepository.markCompleted(request.id);

    await this.timelineRecorder.recordRelationshipCreated(
      identity.id,
      user.id,
      {
        relationshipType: RelationshipType.OWNER,
        accountId: user.id,
        recovery: true,
      },
    );

    this.logger.log(
      `Account recovery completed for ${email} on identity ${identity.id}`,
    );

    const accessToken = await this.appJwtService.sign({
      provider: AuthProvider.LOCAL,
      subject: user.email!,
      email: user.email,
      walletAddress: null,
      displayName: user.displayName,
    });

    return { accessToken };
  }
}
