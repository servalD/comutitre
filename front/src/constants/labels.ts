import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import i18n from '../i18n'
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
  SupportType,
  TransportRightStatus,
  ValidationResult,
  AnomalyStatus,
} from '../domain/types/mobility'

type DomainT = TFunction<'domain'>

const PROFILES: Profile[] = ['junior', 'scolaire', 'etudiant', 'adulte', 'senior', 'tst', 'amethyste']
const IDENTITY_STATUSES: IdentityStatus[] = ['active', 'pending_recovery', 'transferred', 'blocked', 'archived']
const RELATIONSHIPS: RelationshipType[] = ['owner', 'payer', 'legal_guardian', 'manager', 'read_only', 'former_guardian']
const PRODUCTS: ProductType[] = [
  'imagine_r_junior',
  'imagine_r_scolaire',
  'imagine_r_etudiant',
  'navigo_annuel',
  'navigo_senior',
  'liberte_plus',
  'tst',
  'amethyste',
]
const CONTRACT_STATUSES: ContractStatus[] = [
  'draft',
  'pending_document',
  'pending_payment',
  'pending_payer_signature',
  'active',
  'suspended',
  'expired',
  'cancelled',
  'blocked_unpaid',
]
const DOCUMENT_TYPES: DocumentType[] = [
  'identity_document',
  'photo',
  'school_certificate',
  'student_certificate',
  'scholarship_certificate',
  'address_proof',
  'social_right',
  'payment_mandate',
]
const DOCUMENT_STATUSES: DocumentStatus[] = [
  'uploaded',
  'pending_verification',
  'accepted',
  'refused',
  'expired',
  'missing',
]
const SUPPORT_STATUSES: SupportStatus[] = [
  'active',
  'lost',
  'stolen',
  'revoked',
  'replaced',
  'expired',
  'pending_activation',
  'support_non_reclame',
]
const SUPPORT_TYPES: SupportType[] = ['physical_card', 'phone', 'watch']
const TRANSPORT_RIGHT_STATUSES: TransportRightStatus[] = ['active', 'suspended', 'expired', 'revoked']
const VALIDATION_RESULTS: ValidationResult[] = ['accepted', 'rejected', 'anomaly']
const ANOMALY_STATUSES: AnomalyStatus[] = ['open', 'in_review', 'closed']

function record<K extends string>(t: DomainT, section: string, keys: K[]): Record<K, string> {
  return Object.fromEntries(keys.map((k) => [k, t(`${section}.${k}`)])) as Record<K, string>
}

const td = (key: string) => i18n.t(key, { ns: 'domain' })

export interface DomainLabels {
  profileLabels: Record<Profile, string>
  identityStatusLabels: Record<IdentityStatus, string>
  relationshipLabels: Record<RelationshipType, string>
  productLabels: Record<ProductType, string>
  contractStatusLabels: Record<ContractStatus, string>
  documentTypeLabels: Record<DocumentType, string>
  documentStatusLabels: Record<DocumentStatus, string>
  supportStatusLabels: Record<SupportStatus, string>
  supportTypeLabels: Record<SupportType, string>
  transportRightStatusLabels: Record<TransportRightStatus, string>
  validationResultLabels: Record<ValidationResult, string>
  anomalyStatusLabels: Record<AnomalyStatus, string>
}

export function buildDomainLabels(t: DomainT): DomainLabels {
  return {
    profileLabels: record(t, 'profile', PROFILES),
    identityStatusLabels: record(t, 'identityStatus', IDENTITY_STATUSES),
    relationshipLabels: record(t, 'relationship', RELATIONSHIPS),
    productLabels: record(t, 'product', PRODUCTS),
    contractStatusLabels: record(t, 'contractStatus', CONTRACT_STATUSES),
    documentTypeLabels: record(t, 'documentType', DOCUMENT_TYPES),
    documentStatusLabels: record(t, 'documentStatus', DOCUMENT_STATUSES),
    supportStatusLabels: record(t, 'supportStatus', SUPPORT_STATUSES),
    supportTypeLabels: record(t, 'supportType', SUPPORT_TYPES),
    transportRightStatusLabels: record(t, 'transportRightStatus', TRANSPORT_RIGHT_STATUSES),
    validationResultLabels: record(t, 'validationResult', VALIDATION_RESULTS),
    anomalyStatusLabels: record(t, 'anomalyStatus', ANOMALY_STATUSES),
  }
}

/** Reactive domain labels for use inside React components. */
export function useLabels(): DomainLabels {
  const { t } = useTranslation('domain')
  return buildDomainLabels(t)
}

/** Single-label resolvers for use outside React (data/domain modules). */
export const labelFor = {
  profile: (value: Profile) => td(`profile.${value}`),
  identityStatus: (value: IdentityStatus) => td(`identityStatus.${value}`),
  relationship: (value: RelationshipType) => td(`relationship.${value}`),
  product: (value: ProductType) => td(`product.${value}`),
  contractStatus: (value: ContractStatus) => td(`contractStatus.${value}`),
  documentType: (value: DocumentType) => td(`documentType.${value}`),
  documentStatus: (value: DocumentStatus) => td(`documentStatus.${value}`),
  supportStatus: (value: SupportStatus) => td(`supportStatus.${value}`),
  supportType: (value: SupportType) => td(`supportType.${value}`),
  transportRightStatus: (value: TransportRightStatus) => td(`transportRightStatus.${value}`),
  validationResult: (value: ValidationResult) => td(`validationResult.${value}`),
  anomalyStatus: (value: AnomalyStatus) => td(`anomalyStatus.${value}`),
  timelineEvent: (value: string) => td(`timelineEvent.${value}`),
  foundSupportDecision: (value: FoundSupportDecision) => td(`foundSupportDecision.${value}`),
  foundSupportNotification: (value: FoundSupportNotificationStrategy) =>
    td(`foundSupportNotification.${value}`),
  foundSupportFinalStatus: (value: FoundSupportFinalStatus) => td(`foundSupportFinalStatus.${value}`),
}
