import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { IdentityStatus } from '../../domain/enums/identity-status.enum';
import { Profile } from '../../domain/enums/profile.enum';
import { AddressRequest } from './create-mobility-identity.request';

export class UpdateMobilityIdentityRequest {
  @ApiPropertyOptional({ example: 'Marie' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Dupont' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: '1990-03-15', format: 'date' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUrl()
  photoUrl?: string | null;

  @ApiPropertyOptional({ type: AddressRequest, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressRequest)
  address?: AddressRequest | null;

  @ApiPropertyOptional({ enum: Profile })
  @IsOptional()
  @IsEnum(Profile)
  currentProfile?: Profile;

  @ApiPropertyOptional({ enum: IdentityStatus })
  @IsOptional()
  @IsEnum(IdentityStatus)
  status?: IdentityStatus;
}
