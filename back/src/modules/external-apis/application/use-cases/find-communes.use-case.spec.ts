import { BadRequestException } from '@nestjs/common';
import { FindCommunesUseCase } from './find-communes.use-case';
import { GeoReferencePort } from '../ports/geo-reference.port';
import { GeoCommune } from '../../domain/external-api.types';

class FailingGeoReference extends GeoReferencePort {
  findCommunes(): Promise<GeoCommune[]> {
    throw new Error('Geo provider should not be called without a filter');
  }
}

describe('FindCommunesUseCase', () => {
  it('rejects an unfiltered commune search to avoid broad live API calls', async () => {
    const useCase = new FindCommunesUseCase(new FailingGeoReference());

    await expect(useCase.execute({})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects a blank commune name before calling the provider', async () => {
    const useCase = new FindCommunesUseCase(new FailingGeoReference());

    await expect(useCase.execute({ nom: '   ' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
