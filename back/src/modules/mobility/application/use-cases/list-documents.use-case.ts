import { Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/user';
import { Document } from '../../domain/document';
import { DocumentRepository } from '../../domain/document.repository';
import { MobilityAccessService } from '../services/mobility-access.service';

@Injectable()
export class ListDocumentsUseCase {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly accessService: MobilityAccessService,
  ) {}

  async execute(user: User, mobilityIdentityId: string): Promise<Document[]> {
    await this.accessService.assertPermission(
      user,
      mobilityIdentityId,
      'canView',
    );

    return this.documentRepository.findByMobilityIdentityId(mobilityIdentityId);
  }
}
