import { ContractStatus } from './enums/contract-status.enum';
import { ProductType } from './enums/product-type.enum';
import { RenewalMode } from './enums/renewal-mode.enum';
import { Contract } from './contract';

export interface CreateContractParams {
  mobilityIdentityId: string;
  payerAccountId?: string | null;
  productType: ProductType;
  status?: ContractStatus;
  validFrom: Date;
  validTo: Date;
  renewalMode?: RenewalMode;
  currentTariff: number;
  cgvVersionAccepted?: string | null;
}

export abstract class ContractRepository {
  abstract findById(id: string): Promise<Contract | null>;
  abstract findByMobilityIdentityId(
    mobilityIdentityId: string,
  ): Promise<Contract[]>;
  abstract create(params: CreateContractParams): Promise<Contract>;
}
