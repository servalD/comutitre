import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { FoundSupportRiskFlag } from '../../domain/enums/found-support-risk-flag.enum';

export class DeclareFoundSupportRequest {
  @ApiProperty({
    description: 'Identifiant technique ou numero mock du support scanne.',
  })
  @IsString()
  supportId: string;

  @ApiProperty({ description: 'Agence ou guichet ayant recu le support.' })
  @IsString()
  agencyId: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  receivedAt?: string;

  @ApiPropertyOptional({ enum: FoundSupportRiskFlag, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(FoundSupportRiskFlag, { each: true })
  riskFlags?: FoundSupportRiskFlag[];
}
