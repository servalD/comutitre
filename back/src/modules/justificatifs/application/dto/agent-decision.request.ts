import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AgentDecisionRequest {
  @ApiProperty({
    description: 'Motif de la décision (obligatoire pour un refus)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motif?: string;
}
