import { Injectable } from '@nestjs/common';
import { EducationRegistryPort } from '../application/ports/education-registry.port';
import { EducationInstitution } from '../domain/external-api.types';

@Injectable()
export class MockEducationRegistryClient extends EducationRegistryPort {
  private readonly institutions: EducationInstitution[] = [
    {
      uai: '0750657N',
      name: 'Universite Paris Cite',
      city: 'Paris',
      departmentCode: '75',
      type: 'enseignement_superieur',
      source: 'education-open-data.mock',
    },
    {
      uai: '0921234A',
      name: 'Lycee de demonstration Nanterre',
      city: 'Nanterre',
      departmentCode: '92',
      type: 'lycee',
      source: 'education-open-data.mock',
    },
  ];

  search(query: string, limit: number): Promise<EducationInstitution[]> {
    const normalizedQuery = query.trim().toLowerCase();
    return Promise.resolve(
      this.institutions
        .filter(
          (institution) =>
            institution.name.toLowerCase().includes(normalizedQuery) ||
            institution.uai.toLowerCase() === normalizedQuery,
        )
        .slice(0, limit),
    );
  }
}
