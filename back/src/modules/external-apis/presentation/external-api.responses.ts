import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VerificationStatus } from '../domain/external-api.types';

export class CoordinatesResponse {
  @ApiProperty({ example: 2.3364 })
  longitude!: number;

  @ApiProperty({ example: 48.8555 })
  latitude!: number;
}

export class AddressCandidateResponse {
  @ApiProperty({ example: '10 Rue de Rivoli 75001 Paris' })
  label!: string;

  @ApiProperty({ example: 0.98 })
  score!: number;

  @ApiProperty({ example: '75001' })
  postalCode!: string;

  @ApiProperty({ example: 'Paris' })
  city!: string;

  @ApiProperty({ example: '75101' })
  cityCode!: string;

  @ApiProperty({ type: CoordinatesResponse })
  coordinates!: CoordinatesResponse;

  @ApiProperty({ example: true })
  isInIleDeFrance!: boolean;

  @ApiProperty({ example: 'geoplateforme.mock' })
  source!: string;
}

export class GeoCommuneResponse {
  @ApiProperty({ example: '75101' })
  code!: string;

  @ApiProperty({ example: 'Paris 1er Arrondissement' })
  name!: string;

  @ApiProperty({ example: ['75001'], isArray: true })
  postalCodes!: string[];

  @ApiProperty({ example: '75' })
  departmentCode!: string;

  @ApiProperty({ example: '11' })
  regionCode!: string;

  @ApiProperty({ example: true })
  isInIleDeFrance!: boolean;

  @ApiProperty({ example: 'api-geo.mock' })
  source!: string;
}

export class CompanyEstablishmentResponse {
  @ApiProperty({ example: '55210055400013' })
  siret!: string;

  @ApiProperty({ example: '552100554' })
  siren!: string;

  @ApiProperty({ example: 'Entreprise active de demonstration' })
  name!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiPropertyOptional({ example: 'Paris' })
  address?: string;

  @ApiProperty({ example: 'sirene.mock' })
  source!: string;
}

export class EducationInstitutionResponse {
  @ApiProperty({ example: '0750657N' })
  uai!: string;

  @ApiProperty({ example: 'Universite Paris Cite' })
  name!: string;

  @ApiProperty({ example: 'Paris' })
  city!: string;

  @ApiProperty({ example: '75' })
  departmentCode!: string;

  @ApiProperty({ example: 'enseignement_superieur' })
  type!: string;

  @ApiProperty({ example: 'education-open-data.mock' })
  source!: string;
}

export class VerificationResultResponse {
  @ApiProperty({
    enum: VerificationStatus,
    example: VerificationStatus.VERIFIED,
  })
  status!: VerificationStatus;

  @ApiProperty({ example: 'api-particulier.mock' })
  source!: string;

  @ApiProperty({ example: '2026-06-17T12:00:00.000Z' })
  checkedAt!: string;

  @ApiPropertyOptional({ example: '2026-08-31' })
  expiresAt?: string;

  @ApiPropertyOptional({ example: 'student_scholarship_confirmed' })
  reasonCode?: string;

  @ApiProperty({ example: 'Statut boursier etudiant confirme.' })
  userMessage!: string;

  @ApiPropertyOptional({ example: 'auto_validate_right' })
  backOfficeAction?: string;

  @ApiPropertyOptional({
    description: 'Raw payload from external API response',
  })
  rawPayload?: any;
}
