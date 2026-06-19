import { ValidationResult } from './enums/validation-result.enum';

export class ValidationEvent {
  constructor(
    public readonly id: string,
    public readonly mobilityIdentityId: string,
    public readonly transportRightId: string,
    public readonly supportId: string,
    public readonly stationId: string,
    public readonly validatorId: string,
    public readonly result: ValidationResult,
    public readonly reasonCode: string | null,
    public readonly occurredAt: Date,
    public readonly createdAt: Date,
  ) {}
}
