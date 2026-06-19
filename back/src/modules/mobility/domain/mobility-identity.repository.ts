import { Address } from './address';
import { IdentityStatus } from './enums/identity-status.enum';
import { Profile } from './enums/profile.enum';
import { MobilityIdentity } from './mobility-identity';

export interface CreateMobilityIdentityParams {
  firstName: string;
  lastName: string;
  birthDate: Date;
  photoUrl?: string | null;
  address?: Address | null;
  currentProfile?: Profile;
  status?: IdentityStatus;
}

export interface UpdateMobilityIdentityParams {
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  photoUrl?: string | null;
  address?: Address | null;
  currentProfile?: Profile;
  status?: IdentityStatus;
}

export abstract class MobilityIdentityRepository {
  abstract findById(id: string): Promise<MobilityIdentity | null>;
  abstract findByIds(ids: string[]): Promise<MobilityIdentity[]>;
  abstract findByIdentityTriplet(
    firstName: string,
    lastName: string,
    birthDate: Date,
  ): Promise<MobilityIdentity[]>;
  abstract create(
    params: CreateMobilityIdentityParams,
  ): Promise<MobilityIdentity>;
  abstract update(
    id: string,
    params: UpdateMobilityIdentityParams,
  ): Promise<MobilityIdentity>;
}
