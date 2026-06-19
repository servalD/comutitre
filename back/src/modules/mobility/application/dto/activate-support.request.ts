import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { SupportType } from '../../domain/enums/support-type.enum';

export class ActivateSupportRequest {
  @IsUUID()
  transportRightId: string;

  @IsEnum(SupportType)
  type: SupportType;

  @IsOptional()
  @IsString()
  walletAddress?: string;

  @IsOptional()
  @IsString()
  publicKey?: string;
}
