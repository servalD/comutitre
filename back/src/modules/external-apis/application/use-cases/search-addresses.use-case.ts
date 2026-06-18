import { BadRequestException, Injectable } from '@nestjs/common';
import { AddressLookupPort } from '../ports/address-lookup.port';
import { AddressCandidate } from '../../domain/external-api.types';

@Injectable()
export class SearchAddressesUseCase {
  constructor(private readonly addressLookup: AddressLookupPort) {}

  execute(params: {
    query: string;
    limit?: number;
  }): Promise<AddressCandidate[]> {
    const query = params.query.trim();
    if (query.length < 2) {
      return Promise.reject(
        new BadRequestException('query must contain at least 2 characters'),
      );
    }

    return this.addressLookup.search(query, params.limit ?? 5);
  }
}
