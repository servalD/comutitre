import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export type SupportedLanguage = 'fr' | 'en';

export class ChatHistoryMessageDto {
  @ApiProperty({ enum: ['user', 'assistant'] })
  @IsIn(['user', 'assistant'])
  role!: 'user' | 'assistant';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  content!: string;
}

export class ChatRequestDto {
  @ApiProperty({ example: 'Puis-je prêter mon passe Navigo ?' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  question!: string;

  @ApiPropertyOptional({ type: [ChatHistoryMessageDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryMessageDto)
  history?: ChatHistoryMessageDto[];

  @ApiPropertyOptional({ enum: ['fr', 'en'], default: 'fr' })
  @IsOptional()
  @IsIn(['fr', 'en'])
  language?: SupportedLanguage;
}
