import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from '../../../infrastructure/config/env.validation';
import { GeoReferencePort } from '../application/ports/geo-reference.port';
import { GeoCommune } from '../domain/external-api.types';
import { isIleDeFranceDepartment } from '../domain/ile-de-france';
import { externalFetchSignal } from './external-fetch';

type ApiGeoCommune = {
  code: string;
  nom: string;
  codesPostaux?: string[];
  codeDepartement?: string;
  codeRegion?: string;
};

@Injectable()
export class ApiGeoReferenceClient extends GeoReferencePort {
  constructor(private readonly config: ConfigService<Env, true>) {
    super();
  }

  async findCommunes(params: {
    codePostal?: string;
    nom?: string;
  }): Promise<GeoCommune[]> {
    const baseUrl = this.config.get('API_GEO_BASE_URL', { infer: true });
    const url = new URL(`${baseUrl.replace(/\/$/, '')}/communes`);
    url.searchParams.set(
      'fields',
      'nom,code,codesPostaux,codeDepartement,codeRegion',
    );
    url.searchParams.set('format', 'json');

    if (params.codePostal) {
      url.searchParams.set('codePostal', params.codePostal);
    }
    if (params.nom) {
      url.searchParams.set('nom', params.nom);
      url.searchParams.set('boost', 'population');
    }

    const response = await fetch(url, {
      signal: externalFetchSignal(this.config),
    });
    if (!response.ok) {
      throw new ServiceUnavailableException(
        `API Geo failed with ${response.status}`,
      );
    }

    const payload = (await response.json()) as ApiGeoCommune[];
    return payload.map((commune) => ({
      code: commune.code,
      name: commune.nom,
      postalCodes: commune.codesPostaux ?? [],
      departmentCode: commune.codeDepartement ?? '',
      regionCode: commune.codeRegion ?? '',
      isInIleDeFrance: isIleDeFranceDepartment(commune.codeDepartement),
      source: 'api-geo.live',
    }));
  }
}
