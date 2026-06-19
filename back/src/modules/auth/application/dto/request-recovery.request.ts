import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { normalizeLocalEmailValue } from '../local-email';

export class RequestRecoveryRequest {
  @ApiProperty({ example: 'Jules' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ example: '2009-06-12', format: 'date' })
  @IsDateString()
  birthDate: string;

  @ApiProperty({ example: 'jules.dupont@example.com' })
  @Transform(({ value }) => normalizeLocalEmailValue(value))
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MotDePasse123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}

export class RequestRecoveryResponse {
  message!: string;
  @ApiPropertyOptional({
    description: 'E-mail masqué du responsable légal destinataire du code',
    example: 'm***@example.com',
  })
  maskedGuardianEmail?: string;
  @ApiPropertyOptional({ description: 'Code de vérification (dev uniquement)' })
  devCode?: string;
}
