import { GeoCommune } from '../../domain/external-api.types';

export abstract class GeoReferencePort {
  abstract findCommunes(params: {
    codePostal?: string;
    nom?: string;
  }): Promise<GeoCommune[]>;
}
