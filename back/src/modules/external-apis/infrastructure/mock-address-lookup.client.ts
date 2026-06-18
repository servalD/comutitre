import { Injectable } from '@nestjs/common';
import { AddressLookupPort } from '../application/ports/address-lookup.port';
import { AddressCandidate } from '../domain/external-api.types';

@Injectable()
export class MockAddressLookupClient extends AddressLookupPort {
  private readonly candidates: AddressCandidate[] = [
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
    {
      label: '1 Place Bellecour 69002 Lyon',
      score: 0.94,
      postalCode: '69002',
      city: 'Lyon',
      cityCode: '69382',
      coordinates: { longitude: 4.832, latitude: 45.7578 },
      isInIleDeFrance: false,
      source: 'geoplateforme.mock',
    },
  ];

  search(query: string, limit: number): Promise<AddressCandidate[]> {
    const normalizedQuery = query.trim().toLowerCase();
    return Promise.resolve(
      this.candidates
        .filter((candidate) =>
          candidate.label.toLowerCase().includes(normalizedQuery),
        )
        .slice(0, limit),
    );
  }
}
