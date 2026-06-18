import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ContractStatus } from '../../domain/enums/contract-status.enum';
import { ProductType } from '../../domain/enums/product-type.enum';
import { RenewalMode } from '../../domain/enums/renewal-mode.enum';

export class CreateContractRequest {
  @ApiProperty({ enum: ProductType, example: ProductType.IMAGINE_R_SCOLAIRE })
  @IsEnum(ProductType)
  productType: ProductType;

  @ApiPropertyOptional({ enum: ContractStatus })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @ApiProperty({ example: '2025-09-01T00:00:00.000Z' })
  @IsDateString()
  validFrom: string;

  @ApiProperty({ example: '2026-08-31T23:59:59.000Z' })
  @IsDateString()
  validTo: string;

  @ApiPropertyOptional({ enum: RenewalMode })
  @IsOptional()
  @IsEnum(RenewalMode)
  renewalMode?: RenewalMode;

  @ApiProperty({ example: 350.5 })
  @IsNumber()
  @Min(0)
  currentTariff: number;

  @ApiPropertyOptional({ example: '2025-2026' })
  @IsOptional()
  @IsString()
  cgvVersionAccepted?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Defaults to the authenticated account',
  })
  @IsOptional()
  @IsUUID()
  payerAccountId?: string;
}
