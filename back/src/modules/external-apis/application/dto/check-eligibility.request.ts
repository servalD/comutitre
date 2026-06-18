import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EligibilityCheckType } from '../../domain/external-api.types';

export class CheckEligibilityRequest {
  @ApiProperty({ enum: EligibilityCheckType })
  @IsEnum(EligibilityCheckType)
  type!: EligibilityCheckType;

  @ApiPropertyOptional({
    description: 'Scenario de simulation',
    example: 'confirmed',
  })
  @IsOptional()
  @IsString()
  scenario?: string;

  @ApiPropertyOptional({
    description: "Numero d'allocataire CNAF",
    example: '1234567',
  })
  @IsOptional()
  @IsString()
  numeroAllocataire?: string;

  @ApiPropertyOptional({ description: 'Code postal', example: '75001' })
  @IsOptional()
  @IsString()
  codePostal?: string;

  @ApiPropertyOptional({
    description: 'Identifiant National Eleve (INE)',
    example: '123456789AA',
  })
  @IsOptional()
  @IsString()
  ine?: string;

  @ApiPropertyOptional({
    description: 'Numero fiscal de reference DGFiP',
    example: '1234567890123',
  })
  @IsOptional()
  @IsString()
  numeroFiscal?: string;

  @ApiPropertyOptional({
    description: "Reference de l'avis d'impot DGFiP",
    example: '12A3456789012',
  })
  @IsOptional()
  @IsString()
  referenceAvis?: string;

  @ApiPropertyOptional({ description: 'Nom de famille', example: 'DUPONT' })
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiPropertyOptional({ description: 'Prenom', example: 'Jean' })
  @IsOptional()
  @IsString()
  prenom?: string;

  @ApiPropertyOptional({ description: 'Sexe (F ou M)', example: 'M' })
  @IsOptional()
  @IsString()
  sexe?: string;

  @ApiPropertyOptional({
    description: 'Date de naissance au format AAAA-MM-JJ',
    example: '2005-04-15',
  })
  @IsOptional()
  @IsString()
  dateNaissance?: string;

  @ApiPropertyOptional({
    description: 'Code etab (UAI) CNAF/MEN',
    example: '0750657N',
  })
  @IsOptional()
  @IsString()
  codeEtablissement?: string;

  @ApiPropertyOptional({
    description: 'Annee scolaire / universitaire',
    example: '2025/2026',
  })
  @IsOptional()
  @IsString()
  anneeScolaire?: string;
}
