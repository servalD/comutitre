import { CompanyEstablishment } from '../../domain/external-api.types';

export abstract class CompanyRegistryPort {
  abstract findBySiret(siret: string): Promise<CompanyEstablishment | null>;
}
