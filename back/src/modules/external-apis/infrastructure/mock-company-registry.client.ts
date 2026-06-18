import { Injectable } from '@nestjs/common';
import { CompanyRegistryPort } from '../application/ports/company-registry.port';
import { CompanyEstablishment } from '../domain/external-api.types';

@Injectable()
export class MockCompanyRegistryClient extends CompanyRegistryPort {
  private readonly establishments = new Map<string, CompanyEstablishment>([
    [
      '55210055400013',
      {
        siret: '55210055400013',
        siren: '552100554',
        name: 'Entreprise active de demonstration',
        isActive: true,
        address: 'Paris',
        source: 'sirene.mock',
      },
    ],
    [
      '00000000000000',
      {
        siret: '00000000000000',
        siren: '000000000',
        name: 'Etablissement ferme de demonstration',
        isActive: false,
        address: 'Nanterre',
        source: 'sirene.mock',
      },
    ],
  ]);

  findBySiret(siret: string): Promise<CompanyEstablishment | null> {
    return Promise.resolve(this.establishments.get(siret) ?? null);
  }
}
