import { Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/user';
import { Support } from '../../domain/support';
import { SupportRepository } from '../../domain/support.repository';
import { CreateSupportRequest } from '../dto/create-support.request';
import { MobilityAccessService } from '../services/mobility-access.service';
import { TimelineRecorderService } from '../services/timeline-recorder.service';

@Injectable()
export class CreateSupportUseCase {
  constructor(
    private readonly supportRepository: SupportRepository,
    private readonly accessService: MobilityAccessService,
    private readonly timelineRecorder: TimelineRecorderService,
  ) {}

  async execute(
    user: User,
    mobilityIdentityId: string,
    request: CreateSupportRequest,
  ): Promise<Support> {
    await this.accessService.assertPermission(
      user,
      mobilityIdentityId,
      'canManageSupport',
    );

    const support = await this.supportRepository.create({
      mobilityIdentityId,
      contractId: request.contractId ?? null,
      type: request.type,
      status: request.status,
      publicKey: request.publicKey ?? null,
      activatedAt: request.activatedAt ? new Date(request.activatedAt) : null,
      expiresAt: request.expiresAt ? new Date(request.expiresAt) : null,
    });

    await this.timelineRecorder.recordSupportAdded(
      mobilityIdentityId,
      support.id,
      user.id,
      {
        type: support.type,
        status: support.status,
      },
    );

    return support;
  }
}
