import { Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/user';
import { MobilityIdentity } from '../../domain/mobility-identity';
import { Relationship } from '../../domain/relationship';
import { MobilityIdentityRepository } from '../../domain/mobility-identity.repository';
import { RelationshipRepository } from '../../domain/relationship.repository';

export interface IdentityWithRelationships {
  identity: MobilityIdentity;
  relationships: Relationship[];
}

@Injectable()
export class ListMyIdentitiesUseCase {
  constructor(
    private readonly relationshipRepository: RelationshipRepository,
    private readonly mobilityIdentityRepository: MobilityIdentityRepository,
  ) {}

  async execute(user: User): Promise<IdentityWithRelationships[]> {
    const relationships = await this.relationshipRepository.findByAccountId(
      user.id,
    );

    const identityIds = [
      ...new Set(
        relationships.map((relationship) => relationship.mobilityIdentityId),
      ),
    ];

    const identities =
      await this.mobilityIdentityRepository.findByIds(identityIds);

    const identityMap = new Map(
      identities.map((identity) => [identity.id, identity]),
    );

    return identityIds
      .map((identityId) => {
        const identity = identityMap.get(identityId);
        if (!identity) {
          return null;
        }

        return {
          identity,
          relationships: relationships.filter(
            (relationship) => relationship.mobilityIdentityId === identityId,
          ),
        };
      })
      .filter((item): item is IdentityWithRelationships => item !== null);
  }
}
