import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsPostalCode, IsString, MinLength } from 'class-validator';

const trimString = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class FindCommunesRequest {
  @ApiPropertyOptional({ example: '75001' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => trimString(value))
  @IsPostalCode('FR')
  codePostal?: string;

  @ApiPropertyOptional({ example: 'Paris' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => trimString(value))
  @IsString()
  @MinLength(2)
  nom?: string;
}
