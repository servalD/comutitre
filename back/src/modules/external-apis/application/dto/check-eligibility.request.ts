import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { EligibilityCheckType } from '../../domain/external-api.types';

export class CheckEligibilityRequest {
  @ApiProperty({ enum: EligibilityCheckType })
  @IsEnum(EligibilityCheckType)
  type!: EligibilityCheckType;
}
