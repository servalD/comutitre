import { Contract } from './contract';

export abstract class ContractRepository {
  abstract save(contract: Contract): Promise<Contract>;
  abstract findById(id: string): Promise<Contract | null>;
  abstract findByUserId(userId: string): Promise<Contract[]>;
  abstract findByYousignSignatureRequestId(
    signatureRequestId: string,
  ): Promise<Contract | null>;
}
