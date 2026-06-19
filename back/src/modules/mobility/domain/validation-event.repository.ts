import { ValidationResult } from './enums/validation-result.enum';
import { ValidationEvent } from './validation-event';

export interface AppendValidationEventParams {
  mobilityIdentityId: string;
  transportRightId: string;
  supportId: string;
  stationId: string;
  validatorId: string;
  result: ValidationResult | string;
  reasonCode?: string | null;
  occurredAt: Date;
}

export abstract class ValidationEventRepository {
  abstract append(
    params: AppendValidationEventParams,
  ): Promise<ValidationEvent>;
  abstract findLastAcceptedByRight(
    transportRightId: string,
  ): Promise<ValidationEvent | null>;
}
