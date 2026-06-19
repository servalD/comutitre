import { Injectable } from '@nestjs/common';
import { RelationshipType } from '../../../mobility/domain/enums/relationship-type.enum';
import { MobilityIdentity } from '../../../mobility/domain/mobility-identity';
import { MobilityIdentityRepository } from '../../../mobility/domain/mobility-identity.repository';
import { RelationshipRepository } from '../../../mobility/domain/relationship.repository';
import { UserRepository } from '../../../users/domain/user.repository';

@Injectable()
export class RecoverableIdentityLookupService {
  constructor(
    private readonly mobilityIdentityRepository: MobilityIdentityRepository,
    private readonly relationshipRepository: RelationshipRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async findRecoverable(
    firstName: string,
    lastName: string,
    birthDate: Date,
  ): Promise<MobilityIdentity | null> {
    const candidates =
      await this.mobilityIdentityRepository.findByIdentityTriplet(
        firstName,
        lastName,
        birthDate,
      );

    for (const identity of candidates) {
      const hasOwner = await this.relationshipRepository.hasActiveOwner(
        identity.id,
      );
      if (!hasOwner) {
        return identity;
      }
    }

    return null;
  }

  maskHolder(firstName: string, lastName: string): string {
    const mask = (value: string) =>
      value.length <= 1 ? `${value}***` : `${value[0]}***`;
    return `${mask(firstName.trim())} ${mask(lastName.trim())}`;
  }

  maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return '***@***';
    const maskedLocal = local.length <= 1 ? `${local}***` : `${local[0]}***`;
    return `${maskedLocal}@${domain}`;
  }

  async findLegalGuardianEmail(
    mobilityIdentityId: string,
  ): Promise<string | null> {
    const relationships =
      await this.relationshipRepository.findByMobilityIdentityId(
        mobilityIdentityId,
      );
    const guardian = relationships.find(
      (rel) => rel.relationshipType === RelationshipType.LEGAL_GUARDIAN,
    );
    if (!guardian) {
      return null;
    }

    const user = await this.userRepository.findById(guardian.accountId);
    return user?.email ?? null;
  }
}
