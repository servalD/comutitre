import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { SupportStatus } from '../../domain/enums/support-status.enum';
import { SupportType } from '../../domain/enums/support-type.enum';

export class CreateSupportRequest {
  @ApiPropertyOptional({
    enum: SupportType,
    default: SupportType.PHYSICAL_CARD,
  })
  @IsOptional()
  @IsEnum(SupportType)
  type?: SupportType;

  @ApiPropertyOptional({ enum: SupportStatus })
  @IsOptional()
  @IsEnum(SupportStatus)
  status?: SupportStatus;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  contractId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  publicKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  activatedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
