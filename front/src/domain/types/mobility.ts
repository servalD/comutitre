export type Profile =
  | 'junior'
  | 'scolaire'
  | 'etudiant'
  | 'adulte'
  | 'senior'
  | 'tst'
  | 'amethyste'

export type IdentityStatus =
  | 'active'
  | 'pending_recovery'
  | 'transferred'
  | 'blocked'
  | 'archived'

export type RelationshipType =
  | 'owner'
  | 'payer'
  | 'legal_guardian'
  | 'manager'
  | 'read_only'
  | 'former_guardian'

export type RelationshipStatus = 'active' | 'revoked' | 'pending_transfer' | 'expired'

export type ProductType =
  | 'imagine_r_junior'
  | 'imagine_r_scolaire'
  | 'imagine_r_etudiant'
  | 'navigo_annuel'
  | 'navigo_senior'
  | 'liberte_plus'
  | 'tst'
  | 'amethyste'

export type ContractStatus =
  | 'draft'
  | 'pending_document'
  | 'pending_payment'
  | 'pending_payer_signature'
  | 'active'
  | 'suspended'
  | 'expired'
  | 'cancelled'
  | 'blocked_unpaid'

export type DocumentType =
  | 'identity_document'
  | 'photo'
  | 'school_certificate'
  | 'student_certificate'
  | 'scholarship_certificate'
  | 'address_proof'
  | 'social_right'
  | 'payment_mandate'

export type DocumentStatus =
  | 'uploaded'
  | 'pending_verification'
  | 'accepted'
  | 'refused'
  | 'expired'
  | 'missing'

export type SupportType = 'physical_card'

export type SupportStatus =
  | 'active'
  | 'lost'
  | 'stolen'
  | 'revoked'
  | 'replaced'
  | 'expired'
  | 'pending_activation'
  | 'support_non_reclame'

export type FoundSupportDecision =
  | 'FOUND_PICKUP_ALLOWED'
  | 'CONTROLLED_REUSE_ELIGIBLE'
  | 'BACKOFFICE_REVIEW_REQUIRED'
  | 'SUPPORT_ALREADY_REPLACED'
  | 'SUPPORT_UNUSABLE'
  | 'UNKNOWN_SUPPORT'

export type FoundSupportNotificationStrategy =
  | 'SECURITY_NOTICE'
  | 'PICKUP_AVAILABLE'
  | 'LEGAL_GUARDIAN_OR_PAYER'
  | 'REVIEW_BEFORE_NOTIFICATION'
  | 'SUPPORT_UNUSABLE_NOTICE'
  | 'UNKNOWN_SUPPORT_NO_NOTIFICATION'

export type FoundSupportFinalStatus =
  | 'withdrawn'
  | 'not_claimed'
  | 'archived'
  | 'destroyed'
  | 'sent_to_backoffice'
  | 'unusable_confirmed'

export type FoundSupportRiskFlag = 'unpaid' | 'fraud' | 'litigation'

export type RenewalMode = 'automatic' | 'manual'

export interface Address {
  street?: string
  city?: string
  postalCode?: string
  country?: string
}

export interface PermissionSet {
  canView: boolean
  canEditIdentity: boolean
  canSubscribe: boolean
  canPay: boolean
  canManageDocuments: boolean
  canManageSupport: boolean
  canTransferOwnership: boolean
  canViewHistory: boolean
}

export interface MobilityIdentity {
  id: string
  firstName: string
  lastName: string
  birthDate: string
  calculatedAge: number
  photoUrl: string | null
  address: Address | null
  currentProfile: Profile
  status: IdentityStatus
  createdAt: string
  updatedAt: string
}

export interface Relationship {
  id: string
  accountId: string
  mobilityIdentityId: string
  relationshipType: RelationshipType
  permissions: PermissionSet
  status: RelationshipStatus
  createdAt: string
  revokedAt: string | null
}

export interface MobilityIdentityWithRelationships extends MobilityIdentity {
  relationships: Relationship[]
}

export interface Contract {
  id: string
  mobilityIdentityId: string
  payerAccountId: string | null
  productType: ProductType
  status: ContractStatus
  validFrom: string
  validTo: string
  renewalMode: RenewalMode
  currentTariff: number
  cgvVersionAccepted: string | null
  createdAt: string
  updatedAt: string
}

export interface Document {
  id: string
  mobilityIdentityId: string
  contractId: string | null
  type: DocumentType
  status: DocumentStatus
  refusalReason: string | null
  uploadedAt: string
  verifiedAt: string | null
  verifiedBy: string | null
  createdAt: string
  updatedAt: string
}

export interface Support {
  id: string
  mobilityIdentityId: string
  contractId: string | null
  type: SupportType
  status: SupportStatus
  publicKey: string | null
  activatedAt: string | null
  revokedAt: string | null
  expiresAt: string | null
  lastUsedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface TimelineEvent {
  id: string
  mobilityIdentityId: string
  contractId: string | null
  supportId: string | null
  actorType: string
  actorId: string | null
  type: string
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface FoundSupportCase {
  id: string | null
  supportId: string
  mobilityIdentityId: string | null
  contractId: string | null
  agencyId: string
  receivedAt: string
  agentId: string
  supportStatus: SupportStatus | null
  holderMaskedName: string | null
  decision: FoundSupportDecision
  notificationStrategy: FoundSupportNotificationStrategy
  pickupDeadline: string | null
  finalStatus: FoundSupportFinalStatus | null
  userMessage: string[]
}

export interface FoundSupportClosure {
  id: string
  supportFoundEventId: string
  supportId: string
  mobilityIdentityId: string
  finalStatus: FoundSupportFinalStatus
  closedAt: string
  closedByAgentId: string
  withdrawnAt: string | null
  withdrawnByAgentId: string | null
  identityCheckPerformed: boolean
  withdrawalProofReference: string | null
  supportStatusAfterClosure: SupportStatus | null
}

export interface CreateMobilityIdentityPayload {
  firstName: string
  lastName: string
  birthDate: string
  photoUrl?: string
  currentProfile?: Profile
}

export interface UpdateMobilityIdentityPayload {
  firstName?: string
  lastName?: string
  birthDate?: string
  photoUrl?: string | null
  currentProfile?: Profile
}

export interface CreateRelationshipPayload {
  mobilityIdentityId: string
  relationshipType: RelationshipType
}

export interface CreateContractPayload {
  productType: ProductType
  status?: ContractStatus
  validFrom: string
  validTo: string
  renewalMode?: RenewalMode
  currentTariff: number
  cgvVersionAccepted?: string
}

export interface CreateDocumentPayload {
  type: DocumentType
  status?: DocumentStatus
  contractId?: string
}

export interface CreateSupportPayload {
  type?: SupportType
  status?: SupportStatus
  contractId?: string
}

export interface DeclareFoundSupportPayload {
  supportId: string
  agencyId: string
  receivedAt?: string
  riskFlags?: FoundSupportRiskFlag[]
}

export interface CloseFoundSupportPayload {
  finalStatus: FoundSupportFinalStatus
  identityCheckPerformed?: boolean
  withdrawalProofReference?: string
}
