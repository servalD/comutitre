import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { RelationshipType } from '../../domain/enums/relationship-type.enum';

export class CreateRelationshipRequest {
  @ApiProperty({ format: 'uuid', description: 'Mobility identity to link' })
  @IsUUID()
  mobilityIdentityId: string;

  @ApiProperty({ enum: RelationshipType, example: RelationshipType.OWNER })
  @IsEnum(RelationshipType)
  relationshipType: RelationshipType;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Defaults to the authenticated account',
  })
  @IsOptional()
  @IsUUID()
  accountId?: string;
}
