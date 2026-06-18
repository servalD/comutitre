import { Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/user';
import { Document } from '../../domain/document';
import { DocumentRepository } from '../../domain/document.repository';
import { CreateDocumentRequest } from '../dto/create-document.request';
import { MobilityAccessService } from '../services/mobility-access.service';
import { TimelineRecorderService } from '../services/timeline-recorder.service';

@Injectable()
export class CreateDocumentUseCase {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly accessService: MobilityAccessService,
    private readonly timelineRecorder: TimelineRecorderService,
  ) {}

  async execute(
    user: User,
    mobilityIdentityId: string,
    request: CreateDocumentRequest,
  ): Promise<Document> {
    await this.accessService.assertPermission(
      user,
      mobilityIdentityId,
      'canManageDocuments',
    );

    const document = await this.documentRepository.create({
      mobilityIdentityId,
      contractId: request.contractId ?? null,
      type: request.type,
      status: request.status,
    });

    await this.timelineRecorder.recordDocumentUploaded(
      mobilityIdentityId,
      user.id,
      {
        documentId: document.id,
        type: document.type,
        status: document.status,
      },
    );

    return document;
  }
}
