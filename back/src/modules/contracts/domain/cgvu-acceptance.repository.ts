import { CgvuAcceptance } from './cgvu-acceptance';

export abstract class CgvuAcceptanceRepository {
  abstract save(acceptance: CgvuAcceptance): Promise<CgvuAcceptance>;
  abstract findByContractId(contractId: string): Promise<CgvuAcceptance[]>;
}
