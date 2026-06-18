import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from '../../../infrastructure/config/env.validation';
import { AddressLookupPort } from '../application/ports/address-lookup.port';
import { AddressCandidate } from '../domain/external-api.types';
import { isIleDeFrancePostalCode } from '../domain/ile-de-france';
import { externalFetchSignal } from './external-fetch';

type GeocodingFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    label?: string;
    score?: number;
    postcode?: string;
    city?: string;
    citycode?: string;
  };
};

@Injectable()
export class GeoplateformeAddressClient extends AddressLookupPort {
  constructor(private readonly config: ConfigService<Env, true>) {
    super();
  }

  async search(query: string, limit: number): Promise<AddressCandidate[]> {
    const baseUrl = this.config.get('GEOPLATEFORME_GEOCODING_URL', {
      infer: true,
    });
    const url = new URL(baseUrl);
    url.searchParams.set('q', query);
    url.searchParams.set('limit', String(limit));

    const response = await fetch(url, {
      signal: externalFetchSignal(this.config),
    });
    if (!response.ok) {
      throw new ServiceUnavailableException(
        `Geoplateforme geocoding failed with ${response.status}`,
      );
    }

    const payload = (await response.json()) as {
      features?: GeocodingFeature[];
    };
    return (payload.features ?? []).map((feature) => {
      const props = feature.properties ?? {};
      const coordinates = feature.geometry?.coordinates ?? [0, 0];
      const postalCode = props.postcode ?? '';

      return {
        label: props.label ?? '',
        score: props.score ?? 0,
        postalCode,
        city: props.city ?? '',
        cityCode: props.citycode ?? '',
        coordinates: {
          longitude: coordinates[0],
          latitude: coordinates[1],
        },
        isInIleDeFrance: isIleDeFrancePostalCode(postalCode),
        source: 'geoplateforme.live',
      };
    });
  }
}
