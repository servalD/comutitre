import { Justificatif } from './justificatif';

export abstract class JustificatifRepository {
  abstract save(justificatif: Justificatif): Promise<Justificatif>;
  abstract findById(id: string): Promise<Justificatif | null>;
  abstract findByContractId(contractId: string): Promise<Justificatif[]>;
  abstract findByYousignVerificationId(
    verificationId: string,
  ): Promise<Justificatif | null>;
  abstract findPending(): Promise<Justificatif[]>;
}
