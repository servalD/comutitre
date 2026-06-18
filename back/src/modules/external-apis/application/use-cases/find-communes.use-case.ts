import { BadRequestException, Injectable } from '@nestjs/common';
import { GeoReferencePort } from '../ports/geo-reference.port';
import { GeoCommune } from '../../domain/external-api.types';

@Injectable()
export class FindCommunesUseCase {
  constructor(private readonly geoReference: GeoReferencePort) {}

  execute(params: {
    codePostal?: string;
    nom?: string;
  }): Promise<GeoCommune[]> {
    const codePostal = params.codePostal?.trim();
    const nom = params.nom?.trim();
    if (!codePostal && !nom) {
      return Promise.reject(
        new BadRequestException(
          'codePostal or nom is required to search communes',
        ),
      );
    }

    return this.geoReference.findCommunes({ codePostal, nom });
  }
}
