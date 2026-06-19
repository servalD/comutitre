import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, MaxLength, MinLength } from 'class-validator';

export class CheckIdentityMatchRequest {
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
}

export class CheckIdentityMatchResponse {
  matched!: boolean;
  maskedHolder?: string;
  recoveryEligible?: boolean;
}
