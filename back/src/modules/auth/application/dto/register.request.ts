import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { normalizeLocalEmailValue } from '../local-email';

export class RegisterRequest {
  @ApiProperty({ example: 'Marie' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ example: '1990-03-15', format: 'date' })
  @IsDateString()
  birthDate: string;

  @ApiProperty({ example: 'marie.dupont@example.com' })
  @Transform(({ value }) => normalizeLocalEmailValue(value))
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MotDePasse123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
