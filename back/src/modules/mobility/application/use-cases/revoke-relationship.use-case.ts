import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../../../users/domain/user';
import { Relationship } from '../../domain/relationship';
import { RelationshipRepository } from '../../domain/relationship.repository';

@Injectable()
export class RevokeRelationshipUseCase {
  constructor(
    private readonly relationshipRepository: RelationshipRepository,
  ) {}

  async execute(user: User, relationshipId: string): Promise<Relationship> {
    const relationship =
      await this.relationshipRepository.findById(relationshipId);
    if (!relationship) {
      throw new NotFoundException('Relationship not found');
    }

    if (!user.isAdmin() && relationship.accountId !== user.id) {
      throw new ForbiddenException('Cannot revoke this relationship');
    }

    return this.relationshipRepository.revoke(relationshipId);
  }
}
