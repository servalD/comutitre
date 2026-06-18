import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { DocumentStatus } from '../../domain/enums/document-status.enum';
import { DocumentType } from '../../domain/enums/document-type.enum';

export class CreateDocumentRequest {
  @ApiProperty({ enum: DocumentType, example: DocumentType.SCHOOL_CERTIFICATE })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiPropertyOptional({ enum: DocumentStatus })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  contractId?: string;
}
