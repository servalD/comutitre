import type {
  ContractStatus,
  DocumentStatus,
  DocumentType,
  FoundSupportDecision,
  FoundSupportFinalStatus,
  FoundSupportNotificationStrategy,
  IdentityStatus,
  ProductType,
  Profile,
  RelationshipType,
  SupportStatus,
} from '../domain/types/mobility'

export const profileLabels: Record<Profile, string> = {
  junior: 'Junior',
  scolaire: 'Scolaire',
  etudiant: 'Etudiant',
  adulte: 'Adulte',
  senior: 'Senior',
  tst: 'TST',
  amethyste: 'Amethyste',
}

export const identityStatusLabels: Record<IdentityStatus, string> = {
  active: 'Actif',
  pending_recovery: 'Recuperation en cours',
  transferred: 'Transfere',
  blocked: 'Bloque',
  archived: 'Archive',
}

export const relationshipLabels: Record<RelationshipType, string> = {
  owner: 'Vous',
  payer: 'Payeur',
  legal_guardian: 'Responsable legal',
  manager: 'Gestionnaire',
  read_only: 'Lecture seule',
  former_guardian: 'Ancien responsable',
}

export const productLabels: Record<ProductType, string> = {
  imagine_r_junior: 'Imagine R Junior',
  imagine_r_scolaire: 'Imagine R Scolaire',
  imagine_r_etudiant: 'Imagine R Etudiant',
  navigo_annuel: 'Navigo Annuel',
  navigo_senior: 'Navigo Senior',
  liberte_plus: 'Navigo Liberte+',
  tst: 'TST',
  amethyste: 'Amethyste',
}

export const contractStatusLabels: Record<ContractStatus, string> = {
  draft: 'Brouillon',
  pending_document: 'Document manquant',
  pending_payment: 'Paiement en attente',
  pending_payer_signature: 'Signature payeur',
  active: 'Actif',
  suspended: 'Suspendu',
  expired: 'Expire',
  cancelled: 'Annule',
  blocked_unpaid: 'Bloque (impaye)',
}

export const documentTypeLabels: Record<DocumentType, string> = {
  identity_document: "Piece d'identite",
  photo: 'Photo',
  school_certificate: 'Certificat scolaire',
  student_certificate: 'Certificat etudiant',
  scholarship_certificate: 'Attestation bourse',
  address_proof: 'Justificatif de domicile',
  social_right: 'Droit social',
  payment_mandate: 'Mandat de paiement',
}

export const documentStatusLabels: Record<DocumentStatus, string> = {
  uploaded: 'Recu',
  pending_verification: 'En verification',
  accepted: 'Accepte',
  refused: 'Refuse',
  expired: 'Expire',
  missing: 'Manquant',
}

export const supportStatusLabels: Record<SupportStatus, string> = {
  active: 'Active',
  lost: 'Perdue',
  stolen: 'Volee',
  revoked: 'Revoquee',
  replaced: 'Remplacee',
  expired: 'Expiree',
  pending_activation: 'En attente',
  support_non_reclame: 'Non reclamee',
}

export const timelineEventLabels: Record<string, string> = {
  MOBILITY_IDENTITY_CREATED: 'Identite creee',
  MOBILITY_IDENTITY_UPDATED: 'Identite mise a jour',
  RELATIONSHIP_CREATED: 'Lien compte cree',
  CONTRACT_CREATED: 'Contrat cree',
  DOCUMENT_UPLOADED: 'Document depose',
  SUPPORT_ADDED: 'Carte ajoutee',
  SUPPORT_FOUND: 'Pass retrouve en agence',
  SUPPORT_FOUND_CLOSED: 'Dossier pass retrouve cloture',
}

export const foundSupportDecisionLabels: Record<FoundSupportDecision, string> = {
  FOUND_PICKUP_ALLOWED: 'En attente de retrait',
  CONTROLLED_REUSE_ELIGIBLE: 'Remise en circulation controlee possible',
  BACKOFFICE_REVIEW_REQUIRED: 'Revue back-office requise',
  SUPPORT_ALREADY_REPLACED: 'Support deja remplace',
  SUPPORT_UNUSABLE: 'Support inutilisable',
  UNKNOWN_SUPPORT: 'Support inconnu',
}

export const foundSupportNotificationLabels: Record<
  FoundSupportNotificationStrategy,
  string
> = {
  SECURITY_NOTICE: 'Notification securite',
  PICKUP_AVAILABLE: 'Retrait possible',
  LEGAL_GUARDIAN_OR_PAYER: 'Responsable legal / payeur',
  REVIEW_BEFORE_NOTIFICATION: 'Revue avant notification',
  SUPPORT_UNUSABLE_NOTICE: 'Information support inutilisable',
  UNKNOWN_SUPPORT_NO_NOTIFICATION: 'Aucune notification',
}

export const foundSupportFinalStatusLabels: Record<
  FoundSupportFinalStatus,
  string
> = {
  withdrawn: 'Retire',
  not_claimed: 'Non reclame',
  archived: 'Archive',
  destroyed: 'Detruit',
  sent_to_backoffice: 'Envoye au back-office',
  unusable_confirmed: 'Inutilisable confirme',
}
