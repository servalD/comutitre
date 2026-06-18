import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class FindCompanyRequest {
  @ApiProperty({ example: '55210055400013' })
  @Matches(/^\d{14}$/)
  siret!: string;
}
