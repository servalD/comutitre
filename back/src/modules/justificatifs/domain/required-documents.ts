import {
  Justificatif,
  JustificatifStatus,
  JustificatifType,
} from './justificatif';

type DocumentType =
  | 'identity_document'
  | 'photo'
  | 'school_certificate'
  | 'student_certificate'
  | 'address_proof'
  | 'payment_mandate'
  | 'social_right';

const CONTRACT_CODE_TO_PRODUCT: Record<string, string> = {
  imagine_r_junior: 'imagine_r_junior',
  imagine_r_scolaire: 'imagine_r_scolaire',
  imagine_r_etudiant: 'imagine_r_etudiant',
  navigo_annuel: 'navigo_annuel',
  navigo_annuel_senior: 'navigo_senior',
  navigo_liberte_plus: 'liberte_plus',
  tst: 'tst',
  amethyste: 'amethyste',
};

const PRODUCT_DOCUMENTS: Record<string, DocumentType[]> = {
  imagine_r_junior: ['identity_document', 'photo', 'school_certificate'],
  imagine_r_scolaire: ['identity_document', 'photo', 'school_certificate'],
  imagine_r_etudiant: ['identity_document', 'photo', 'student_certificate'],
  navigo_annuel: [
    'identity_document',
    'photo',
    'address_proof',
    'payment_mandate',
  ],
  navigo_senior: ['identity_document', 'photo'],
  liberte_plus: ['identity_document', 'payment_mandate'],
  tst: ['identity_document', 'social_right', 'address_proof'],
  amethyste: ['identity_document', 'address_proof'],
};

const DOCUMENT_TO_JUSTIFICATIF: Partial<
  Record<DocumentType, JustificatifType>
> = {
  identity_document: JustificatifType.PIECE_IDENTITE,
  school_certificate: JustificatifType.CERTIFICAT_SCOLARITE,
  student_certificate: JustificatifType.CERTIFICAT_SCOLARITE,
  photo: JustificatifType.PHOTO,
  address_proof: JustificatifType.JUSTIFICATIF_DOMICILE,
  payment_mandate: JustificatifType.MANDAT_SEPA,
  social_right: JustificatifType.ATTESTATION_CAF,
};

const READY_STATUSES = new Set<JustificatifStatus>([
  JustificatifStatus.PRE_QUALIFIE,
  JustificatifStatus.ACCEPTE,
]);

const PENDING_STATUSES = new Set<JustificatifStatus>([
  JustificatifStatus.RECU,
  JustificatifStatus.EN_COURS_DE_VERIFICATION,
]);

const UPLOAD_PRIORITY: Record<JustificatifStatus, number> = {
  [JustificatifStatus.ACCEPTE]: 0,
  [JustificatifStatus.PRE_QUALIFIE]: 1,
  [JustificatifStatus.EN_COURS_DE_VERIFICATION]: 2,
  [JustificatifStatus.RECU]: 3,
  [JustificatifStatus.A_REVOIR]: 4,
  [JustificatifStatus.REFUSE]: 5,
  [JustificatifStatus.INCOMPLET]: 6,
  [JustificatifStatus.EXPIRE]: 7,
};

export interface ContractDocumentsReadiness {
  complete: boolean;
  missing: JustificatifType[];
  pending: JustificatifType[];
}

export function isJustificatifReady(status: JustificatifStatus): boolean {
  return READY_STATUSES.has(status);
}

export function requiredJustificatifTypes(
  productCode: string,
): JustificatifType[] {
  const productType = CONTRACT_CODE_TO_PRODUCT[productCode];
  if (!productType) return [];

  const seen = new Set<JustificatifType>();
  const types: JustificatifType[] = [];

  for (const docType of PRODUCT_DOCUMENTS[productType] ?? []) {
    const justificatifType = DOCUMENT_TO_JUSTIFICATIF[docType];
    if (!justificatifType || seen.has(justificatifType)) continue;
    seen.add(justificatifType);
    types.push(justificatifType);
  }

  return types;
}

function pickBestUpload(
  uploads: Justificatif[],
  type: JustificatifType,
): Justificatif | null {
  const matching = uploads.filter((j) => j.type === type);
  if (matching.length === 0) return null;

  return [...matching].sort((a, b) => {
    const priorityDiff =
      (UPLOAD_PRIORITY[a.status] ?? 99) - (UPLOAD_PRIORITY[b.status] ?? 99);
    if (priorityDiff !== 0) return priorityDiff;
    return b.createdAt.getTime() - a.createdAt.getTime();
  })[0];
}

export function contractDocumentsComplete(
  productCode: string,
  uploads: Justificatif[],
): ContractDocumentsReadiness {
  const required = requiredJustificatifTypes(productCode);
  const missing: JustificatifType[] = [];
  const pending: JustificatifType[] = [];

  for (const type of required) {
    const upload = pickBestUpload(uploads, type);
    if (!upload) {
      missing.push(type);
      continue;
    }
    if (isJustificatifReady(upload.status)) continue;
    if (PENDING_STATUSES.has(upload.status)) {
      pending.push(type);
      continue;
    }
    pending.push(type);
  }

  return {
    complete: missing.length === 0 && pending.length === 0,
    missing,
    pending,
  };
}
