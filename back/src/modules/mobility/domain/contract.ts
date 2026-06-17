import { ContractStatus } from './enums/contract-status.enum';
import { ProductType } from './enums/product-type.enum';
import { RenewalMode } from './enums/renewal-mode.enum';

export class Contract {
  constructor(
    public readonly id: string,
    public readonly mobilityIdentityId: string,
    public readonly payerAccountId: string | null,
    public readonly productType: ProductType,
    public readonly status: ContractStatus,
    public readonly validFrom: Date,
    public readonly validTo: Date,
    public readonly renewalMode: RenewalMode,
    public readonly currentTariff: number,
    public readonly cgvVersionAccepted: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
