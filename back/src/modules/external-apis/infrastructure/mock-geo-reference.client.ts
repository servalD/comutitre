import { Injectable } from '@nestjs/common';
import { GeoReferencePort } from '../application/ports/geo-reference.port';
import { GeoCommune } from '../domain/external-api.types';

@Injectable()
export class MockGeoReferenceClient extends GeoReferencePort {
  private readonly communes: GeoCommune[] = [
    {
      code: '75101',
      name: 'Paris 1er Arrondissement',
      postalCodes: ['75001'],
      departmentCode: '75',
      regionCode: '11',
      isInIleDeFrance: true,
      source: 'api-geo.mock',
    },
    {
      code: '69382',
      name: 'Lyon 2e Arrondissement',
      postalCodes: ['69002'],
      departmentCode: '69',
      regionCode: '84',
      isInIleDeFrance: false,
      source: 'api-geo.mock',
    },
  ];

  findCommunes(params: {
    codePostal?: string;
    nom?: string;
  }): Promise<GeoCommune[]> {
    return Promise.resolve(
      this.communes.filter((commune) => {
        if (params.codePostal) {
          return commune.postalCodes.includes(params.codePostal);
        }

        if (params.nom) {
          return commune.name
            .toLowerCase()
            .includes(params.nom.trim().toLowerCase());
        }

        return false;
      }),
    );
  }
}
