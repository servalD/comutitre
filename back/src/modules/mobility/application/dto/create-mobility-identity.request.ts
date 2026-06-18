import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class AddressRequest {
  @ApiPropertyOptional({ example: '12 rue de Rivoli' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ example: 'Paris' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: '75001' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ example: 'FR' })
  @IsOptional()
  @IsString()
  country?: string;
}

export class CreateMobilityIdentityRequest {
  @ApiProperty({ example: 'Marie' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '1990-03-15', format: 'date' })
  @IsDateString()
  birthDate: string;

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @ApiPropertyOptional({ type: AddressRequest })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressRequest)
  address?: AddressRequest;

  @ApiPropertyOptional({ enum: Profile })
  @IsOptional()
  @IsEnum(Profile)
  currentProfile?: Profile;

  @ApiPropertyOptional({ enum: IdentityStatus })
  @IsOptional()
  @IsEnum(IdentityStatus)
  status?: IdentityStatus;
}
