import type {
  ContractStatus,
  DocumentStatus,
  DocumentType,
  IdentityStatus,
  ProductType,
  Profile,
  RelationshipType,
  SupportStatus,
} from '../domain/types/mobility'

export const profileLabels: Record<Profile, string> = {
  junior: 'Junior',
  scolaire: 'Scolaire',
  etudiant: 'Étudiant',
  adulte: 'Adulte',
  senior: 'Senior',
  tst: 'TST',
  amethyste: 'Améthyste',
}

export const identityStatusLabels: Record<IdentityStatus, string> = {
  active: 'Actif',
  pending_recovery: 'Récupération en cours',
  transferred: 'Transféré',
  blocked: 'Bloqué',
  archived: 'Archivé',
}

export const relationshipLabels: Record<RelationshipType, string> = {
  owner: 'Vous',
  payer: 'Payeur',
  legal_guardian: 'Responsable légal',
  manager: 'Gestionnaire',
  read_only: 'Lecture seule',
  former_guardian: 'Ancien responsable',
}

export const productLabels: Record<ProductType, string> = {
  imagine_r_junior: 'Imagine R Junior',
  imagine_r_scolaire: 'Imagine R Scolaire',
  imagine_r_etudiant: 'Imagine R Étudiant',
  navigo_annuel: 'Navigo Annuel',
  navigo_senior: 'Navigo Senior',
  liberte_plus: 'Navigo Liberté+',
  tst: 'TST',
  amethyste: 'Améthyste',
}

export const contractStatusLabels: Record<ContractStatus, string> = {
  draft: 'Brouillon',
  pending_document: 'Document manquant',
  pending_payment: 'Paiement en attente',
  pending_payer_signature: 'Signature payeur',
  active: 'Actif',
  suspended: 'Suspendu',
  expired: 'Expiré',
  cancelled: 'Annulé',
  blocked_unpaid: 'Bloqué (impayé)',
}

export const documentTypeLabels: Record<DocumentType, string> = {
  identity_document: "Pièce d'identité",
  photo: 'Photo',
  school_certificate: 'Certificat scolaire',
  student_certificate: 'Certificat étudiant',
  scholarship_certificate: 'Attestation bourse',
  address_proof: 'Justificatif de domicile',
  social_right: 'Droit social',
  payment_mandate: 'Mandat de paiement',
}

export const documentStatusLabels: Record<DocumentStatus, string> = {
  uploaded: 'Reçu',
  pending_verification: 'En vérification',
  accepted: 'Accepté',
  refused: 'Refusé',
  expired: 'Expiré',
  missing: 'Manquant',
}

export const supportStatusLabels: Record<SupportStatus, string> = {
  active: 'Active',
  lost: 'Perdue',
  stolen: 'Volée',
  revoked: 'Révoquée',
  replaced: 'Remplacée',
  expired: 'Expirée',
  pending_activation: 'En attente',
}

export const timelineEventLabels: Record<string, string> = {
  MOBILITY_IDENTITY_CREATED: 'Identité créée',
  MOBILITY_IDENTITY_UPDATED: 'Identité mise à jour',
  RELATIONSHIP_CREATED: 'Lien compte créé',
  CONTRACT_CREATED: 'Contrat créé',
  DOCUMENT_UPLOADED: 'Document déposé',
  SUPPORT_ADDED: 'Carte ajoutée',
}
