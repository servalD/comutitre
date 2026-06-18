import { AddressCandidate } from '../../domain/external-api.types';

export abstract class AddressLookupPort {
  abstract search(query: string, limit: number): Promise<AddressCandidate[]>;
}
