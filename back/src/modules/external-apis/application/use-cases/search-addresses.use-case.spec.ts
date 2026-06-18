import { SearchAddressesUseCase } from './search-addresses.use-case';
import { AddressLookupPort } from '../ports/address-lookup.port';
import { AddressCandidate } from '../../domain/external-api.types';
import { BadRequestException } from '@nestjs/common';

class FakeAddressLookup extends AddressLookupPort {
  search(query: string, limit: number): Promise<AddressCandidate[]> {
    if (query !== '10 rue de Rivoli' || limit !== 3) {
      return Promise.resolve([]);
    }

    return Promise.resolve([
      {
        label: '10 Rue de Rivoli 75001 Paris',
        score: 0.98,
        postalCode: '75001',
        city: 'Paris',
        cityCode: '75101',
        coordinates: { longitude: 2.3364, latitude: 48.8555 },
        isInIleDeFrance: true,
        source: 'geoplateforme.mock',
      },
    ]);
  }
}

describe('SearchAddressesUseCase', () => {
  it('returns normalized address candidates from the configured provider', async () => {
    const useCase = new SearchAddressesUseCase(new FakeAddressLookup());

    const results = await useCase.execute({
      query: '10 rue de Rivoli',
      limit: 3,
    });

    expect(results).toEqual([
      {
        label: '10 Rue de Rivoli 75001 Paris',
        score: 0.98,
        postalCode: '75001',
        city: 'Paris',
        cityCode: '75101',
        coordinates: { longitude: 2.3364, latitude: 48.8555 },
        isInIleDeFrance: true,
        source: 'geoplateforme.mock',
      },
    ]);
  });

  it('rejects a blank search query before calling the provider', async () => {
    const useCase = new SearchAddressesUseCase(new FakeAddressLookup());

    await expect(useCase.execute({ query: '   ' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
