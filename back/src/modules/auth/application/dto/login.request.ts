import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { normalizeLocalEmailValue } from '../local-email';

export class LoginRequest {
  @ApiProperty({ example: 'marie.dupont@example.com' })
  @Transform(({ value }) => normalizeLocalEmailValue(value))
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MotDePasse123!' })
  @IsString()
  @MinLength(1)
  password: string;
}
