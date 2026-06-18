import { Address } from './address';
import { IdentityStatus } from './enums/identity-status.enum';
import { Profile } from './enums/profile.enum';

export class MobilityIdentity {
  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly birthDate: Date,
    public readonly photoUrl: string | null,
    public readonly address: Address | null,
    public readonly currentProfile: Profile,
    public readonly status: IdentityStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  get calculatedAge(): number {
    const today = new Date();
    let age = today.getFullYear() - this.birthDate.getFullYear();
    const monthDiff = today.getMonth() - this.birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < this.birthDate.getDate())
    ) {
      age -= 1;
    }
    return age;
  }
}
