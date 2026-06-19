import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class ValidateJourneyEventRequest {
  @IsUUID()
  transportRightId: string;

  @IsUUID()
  supportId: string;

  @IsString()
  stationId: string;

  @IsString()
  validatorId: string;

  @IsOptional()
  @IsDateString()
  occurredAt?: string;
}
