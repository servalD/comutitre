import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginRequest {
  @ApiProperty({ example: 'marie.dupont@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MotDePasse123!' })
  @IsString()
  @MinLength(1)
  password: string;
}
