import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { FoundSupportFinalStatus } from '../../domain/enums/found-support-final-status.enum';

export class CloseFoundSupportCaseRequest {
  @ApiProperty({ enum: FoundSupportFinalStatus })
  @IsEnum(FoundSupportFinalStatus)
  finalStatus: FoundSupportFinalStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  identityCheckPerformed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  withdrawalProofReference?: string;
}
