import { Injectable } from '@nestjs/common';
import { CompanyRegistryPort } from '../ports/company-registry.port';
import { CompanyEstablishment } from '../../domain/external-api.types';

@Injectable()
export class FindCompanyUseCase {
  constructor(private readonly companyRegistry: CompanyRegistryPort) {}

  execute(siret: string): Promise<CompanyEstablishment | null> {
    return this.companyRegistry.findBySiret(siret);
  }
}
