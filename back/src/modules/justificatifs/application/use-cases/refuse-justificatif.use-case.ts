import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JustificatifRepository } from '../../domain/justificatif.repository';

@Injectable()
export class RefuseJustificatifUseCase {
  constructor(private readonly repo: JustificatifRepository) {}

  async execute(params: {
    justificatifId: string;
    agentId: string;
    motif: string;
  }) {
    if (!params.motif?.trim()) {
      throw new BadRequestException('Un motif est obligatoire pour le refus');
    }

    const justificatif = await this.repo.findById(params.justificatifId);
    if (!justificatif) throw new NotFoundException('Justificatif introuvable');

    justificatif.refuse(params.agentId, params.motif);
    await this.repo.save(justificatif);

    return justificatif;
  }
}
