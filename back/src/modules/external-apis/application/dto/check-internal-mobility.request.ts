import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { InternalMobilityCheckType } from '../../domain/external-api.types';

export class CheckInternalMobilityRequest {
  @ApiProperty({ enum: InternalMobilityCheckType })
  @IsEnum(InternalMobilityCheckType)
  type!: InternalMobilityCheckType;
}
