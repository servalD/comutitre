import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';
import { normalizeLocalEmailValue } from '../local-email';

export class CompleteRecoveryRequest {
  @ApiProperty({ example: 'jules.dupont@example.com' })
  @Transform(({ value }) => normalizeLocalEmailValue(value))
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  code: string;
}
