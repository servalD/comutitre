export enum JustificatifType {
  PIECE_IDENTITE = 'piece_identite',
  JUSTIFICATIF_DOMICILE = 'justificatif_domicile',
  CERTIFICAT_SCOLARITE = 'certificat_scolarite',
  ATTESTATION_BOURSE = 'attestation_bourse',
  PHOTO = 'photo',
  MANDAT_SEPA = 'mandat_sepa',
  ATTESTATION_CAF = 'attestation_caf',
  AUTRE = 'autre',
}

export enum JustificatifStatus {
  RECU = 'recu',
  EN_COURS_DE_VERIFICATION = 'en_cours_de_verification',
  PRE_QUALIFIE = 'pre_qualifie',
  A_REVOIR = 'a_revoir',
  ACCEPTE = 'accepte',
  REFUSE = 'refuse',
  INCOMPLET = 'incomplet',
  EXPIRE = 'expire',
}

/** Types that trigger a YouSign Document Verification call. */
export const YOUSIGN_VERIFIED_TYPES = new Set<JustificatifType>([
  JustificatifType.PIECE_IDENTITE,
  JustificatifType.JUSTIFICATIF_DOMICILE,
]);

export class Justificatif {
  constructor(
    public readonly id: string,
    public readonly contractId: string,
    public readonly userId: string,
    public readonly type: JustificatifType,
    public status: JustificatifStatus,
    public readonly filePath: string,
    public readonly originalFilename: string,
    public yousignVerificationId: string | null,
    public yousignStatus: string | null,
    public yousignStatusCodes: string[],
    public agentDecision: string | null,
    public agentMotif: string | null,
    public decidedBy: string | null,
    public decidedAt: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  accept(decidedBy: string, motif?: string): void {
    this.status = JustificatifStatus.ACCEPTE;
    this.agentDecision = 'accepted';
    this.agentMotif = motif ?? null;
    this.decidedBy = decidedBy;
    this.decidedAt = new Date();
    this.updatedAt = new Date();
  }

  refuse(decidedBy: string, motif: string): void {
    this.status = JustificatifStatus.REFUSE;
    this.agentDecision = 'refused';
    this.agentMotif = motif;
    this.decidedBy = decidedBy;
    this.decidedAt = new Date();
    this.updatedAt = new Date();
  }

  applyYousignResult(yousignStatus: string, statusCodes: string[]): void {
    this.yousignStatus = yousignStatus;
    this.yousignStatusCodes = statusCodes;

    const normalized = yousignStatus.toLowerCase();
    if (
      normalized === 'done' ||
      normalized === 'verified' ||
      normalized === 'success'
    ) {
      this.status = JustificatifStatus.PRE_QUALIFIE;
    } else if (
      normalized === 'failed' ||
      normalized === 'inconclusive' ||
      normalized === 'rejected'
    ) {
      this.status = JustificatifStatus.A_REVOIR;
    }
    this.updatedAt = new Date();
  }
}
