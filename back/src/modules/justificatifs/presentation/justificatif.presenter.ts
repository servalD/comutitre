import { ApiProperty } from '@nestjs/swagger';
import { Justificatif } from '../domain/justificatif';

export class JustificatifResponse {
  @ApiProperty() id: string;
  @ApiProperty() contractId: string;
  @ApiProperty() type: string;
  @ApiProperty() status: string;
  @ApiProperty() originalFilename: string;
  @ApiProperty({ required: false }) yousignStatus?: string | null;
  @ApiProperty({ isArray: true, type: String }) yousignStatusCodes: string[];
  @ApiProperty({ required: false }) agentDecision?: string | null;
  @ApiProperty({ required: false }) agentMotif?: string | null;
  @ApiProperty({ required: false }) decidedAt?: Date | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export function toJustificatifResponse(j: Justificatif): JustificatifResponse {
  return {
    id: j.id,
    contractId: j.contractId,
    type: j.type,
    status: j.status,
    originalFilename: j.originalFilename,
    yousignStatus: j.yousignStatus,
    yousignStatusCodes: j.yousignStatusCodes,
    agentDecision: j.agentDecision,
    agentMotif: j.agentMotif,
    decidedAt: j.decidedAt,
    createdAt: j.createdAt,
    updatedAt: j.updatedAt,
  };
}
