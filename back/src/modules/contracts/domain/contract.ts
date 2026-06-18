export enum ContractStatus {
  BROUILLON = 'brouillon',
  EN_ATTENTE_DE_JUSTIFICATIF = 'en_attente_de_justificatif',
  EN_ATTENTE_DE_VALIDATION_DOCUMENTAIRE = 'en_attente_de_validation_documentaire',
  EN_ATTENTE_DE_SIGNATURE_PAYEUR = 'en_attente_de_signature_payeur',
  SIGNATURE_EN_COURS = 'signature_en_cours',
  ACTIF = 'actif',
  SUSPENDU = 'suspendu',
  RESILIÉ = 'resilie',
}

export enum ActorRole {
  HOLDER = 'holder',
  PAYER = 'payer',
  LEGAL_REPRESENTATIVE = 'legal_representative',
}

export class Contract {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly productCode: string,
    public status: ContractStatus,
    public readonly holderFirstName: string,
    public readonly holderLastName: string,
    public readonly holderEmail: string,
    public readonly payerFirstName: string | null,
    public readonly payerLastName: string | null,
    public readonly payerEmail: string | null,
    public readonly legalRepEmail: string | null,
    public yousignSignatureRequestId: string | null,
    public yousignSignatureLink: string | null,
    public readonly cgvuVersion: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  startSignature(
    signatureRequestId: string,
    signatureLink: string | null,
  ): void {
    this.yousignSignatureRequestId = signatureRequestId;
    this.yousignSignatureLink = signatureLink;
    this.status = ContractStatus.SIGNATURE_EN_COURS;
    this.updatedAt = new Date();
  }

  activate(): void {
    this.status = ContractStatus.ACTIF;
    this.updatedAt = new Date();
  }

  /** The email that will be used as the YouSign signer. */
  get signerEmail(): string {
    return this.payerEmail ?? this.holderEmail;
  }

  get signerFirstName(): string {
    return this.payerFirstName ?? this.holderFirstName;
  }

  get signerLastName(): string {
    return this.payerLastName ?? this.holderLastName;
  }
}
