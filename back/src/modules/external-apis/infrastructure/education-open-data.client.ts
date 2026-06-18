import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from '../../../infrastructure/config/env.validation';
import { EducationRegistryPort } from '../application/ports/education-registry.port';
import { EducationInstitution } from '../domain/external-api.types';
import { externalFetchSignal } from './external-fetch';

type EducationRecord = {
  identifiant_de_l_etablissement?: string;
  nom_etablissement?: string;
  nom_commune?: string;
  code_departement?: string;
  type_etablissement?: string;
  record?: {
    fields?: {
      identifiant_de_l_etablissement?: string;
      nom_etablissement?: string;
      nom_commune?: string;
      code_departement?: string;
      type_etablissement?: string;
    };
  };
};

@Injectable()
export class EducationOpenDataClient extends EducationRegistryPort {
  constructor(private readonly config: ConfigService<Env, true>) {
    super();
  }

  async search(query: string, limit: number): Promise<EducationInstitution[]> {
    const baseUrl = this.config.get('EDUCATION_OPEN_DATA_URL', {
      infer: true,
    });
    const url = new URL(baseUrl);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('q', query);

    const response = await fetch(url, {
      signal: externalFetchSignal(this.config),
    });
    if (!response.ok) {
      throw new ServiceUnavailableException(
        `Education open data API failed with ${response.status}`,
      );
    }

    const payload = (await response.json()) as { results?: EducationRecord[] };
    return (payload.results ?? []).map((entry) => {
      const fields = entry.record?.fields ?? entry;
      return {
        uai: fields.identifiant_de_l_etablissement ?? '',
        name: fields.nom_etablissement ?? '',
        city: fields.nom_commune ?? '',
        departmentCode: fields.code_departement ?? '',
        type: fields.type_etablissement ?? '',
        source: 'education-open-data.live',
      };
    });
  }
}
