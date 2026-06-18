import { EducationInstitution } from '../../domain/external-api.types';

export abstract class EducationRegistryPort {
  abstract search(
    query: string,
    limit: number,
  ): Promise<EducationInstitution[]>;
}
