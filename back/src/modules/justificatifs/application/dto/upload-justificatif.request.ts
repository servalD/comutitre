import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { JustificatifType } from '../../domain/justificatif';

export class UploadJustificatifRequest {
  @ApiProperty({ description: 'ID du contrat associé', format: 'uuid' })
  @IsUUID()
  contractId: string;

  @ApiProperty({ enum: JustificatifType })
  @IsEnum(JustificatifType)
  type: JustificatifType;

  /** Présent dans le multipart — géré par @UploadedFile(), pas validé ici. */
  @Allow()
  @ApiProperty({ type: 'string', format: 'binary' })
  file?: unknown;

  @ApiProperty({
    description: 'Prénom du porteur (requis pour la vérification YouSign)',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'Nom du porteur (requis pour la vérification YouSign)',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;
}
