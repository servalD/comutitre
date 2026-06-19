import type { ContractResponse } from '../api/contracts'
import type { JustificatifResponse } from '../api/justificatifs'
import { MOCK_DOSSIER } from '../data/mock'
import {
  buildRequiredDocumentSlots,
  countFilledSlots,
  countReadySlots,
  requiredDocumentLabelsFromSlots,
} from './justificatif-slots'
import { contractCodeToProductType } from './subscription-advisor/contract-mapping'
import { productCatalog } from './subscription-advisor/catalog'

export const SUBSCRIPTION_DOSSIER_STEPS = MOCK_DOSSIER.steps

export const PENDING_SUBSCRIPTION_STATUSES = [
  'brouillon',
  'en_attente_de_justificatif',
  'en_attente_de_validation_documentaire',
  'en_attente_de_signature_payeur',
  'signature_en_cours',
  'en_attente_paiement',
] as const

export type PendingSubscriptionStatus = (typeof PENDING_SUBSCRIPTION_STATUSES)[number]

export const subscriptionContractStatusLabels: Record<string, string> = {
  brouillon: 'Brouillon',
  en_attente_de_justificatif: 'Justificatifs à déposer',
  en_attente_de_validation_documentaire: 'Validation documentaire',
  en_attente_de_signature_payeur: 'Signature payeur',
  signature_en_cours: 'Signature en cours',
  en_attente_paiement: 'Paiement à finaliser',
  actif: 'Titre actif',
  suspendu: 'Suspendu',
  resilie: 'Résilié',
}

export interface SubscriptionDossierView {
  contractId: string
  product: string
  productCode: string
  beneficiaryFirstName: string
  beneficiaryFullName: string
  payerFullName: string
  payerEmail: string | null
  holderEmail: string
  status: string
  statusLabel: string
  currentStep: number
  totalSteps: number
  steps: { id: number; label: string }[]
  stepHint: string
  createdAt: string
  documentsDeposed: number
  documentsRequired: number
  requiredDocumentLabels: string[]
}

export function productLabelFromContractCode(code: string): string {
  const productType = contractCodeToProductType(code)
  if (productType) return productCatalog[productType].label
  return code.replace(/_/g, ' ')
}

export function requiredDocumentLabelsForProduct(productCode: string): string[] {
  return requiredDocumentLabelsFromSlots(
    buildRequiredDocumentSlots(productCode),
  )
}

export function subscriptionStatusToStep(status: string): number {
  switch (status) {
    case 'brouillon':
      return 1
    case 'en_attente_de_justificatif':
      return 2
    case 'en_attente_de_signature_payeur':
    case 'signature_en_cours':
    case 'en_attente_paiement':
      return 4
    case 'en_attente_de_validation_documentaire':
    case 'actif':
      return 5
    default:
      return 2
  }
}

const STEP_HINTS: Record<number, string> = {
  1: 'Complétez les informations pour avancer dans la demande.',
  2: 'Déposez vos justificatifs pour continuer.',
  3: 'Vos documents sont en cours de vérification.',
  4: 'Signez les CGVU et finalisez le paiement.',
  5: 'Votre demande est en cours de validation.',
}

function formatPayerLabel(contract: ContractResponse): string {
  const payerFirst = contract.payerFirstName?.trim()
  const payerLast = contract.payerLastName?.trim()
  if (payerFirst || payerLast) {
    return [payerFirst, payerLast].filter(Boolean).join(' ')
  }
  if (contract.payerEmail) {
    return contract.payerEmail
  }
  return 'Compte connecté'
}

export function buildSubscriptionDossierView(
  contract: ContractResponse,
  uploads: JustificatifResponse[] = [],
): SubscriptionDossierView {
  const product = productLabelFromContractCode(contract.productCode)
  const slots = buildRequiredDocumentSlots(contract.productCode, uploads)
  const requiredDocumentLabels = requiredDocumentLabelsFromSlots(slots)
  const currentStep = subscriptionStatusToStep(contract.status)

  const deposedCount = countFilledSlots(slots)
  const readyCount = countReadySlots(slots)

  let stepHint = STEP_HINTS[currentStep] ?? STEP_HINTS[2]
  if (contract.status === 'actif') {
    stepHint = 'Votre titre est actif et visible sur la fiche du bénéficiaire.'
  } else if (contract.status === 'en_attente_de_validation_documentaire') {
    stepHint =
      'Votre dossier est en cours de validation par nos équipes. Vous serez notifié dès que votre titre sera prêt.'
  } else if (contract.status === 'en_attente_paiement') {
    stepHint = 'Finalisez le paiement pour transmettre votre dossier à validation.'
  } else if (currentStep === 2 && requiredDocumentLabels.length > 0) {
    if (readyCount === requiredDocumentLabels.length) {
      stepHint = 'Tous vos justificatifs sont conformes — vous pouvez passer à la signature.'
    } else {
      stepHint = `${readyCount}/${requiredDocumentLabels.length} document${requiredDocumentLabels.length > 1 ? 's' : ''} conforme${readyCount > 1 ? 's' : ''} — complétez vos justificatifs.`
    }
  }

  return {
    contractId: contract.id,
    product,
    productCode: contract.productCode,
    beneficiaryFirstName: contract.holderFirstName ?? '',
    beneficiaryFullName:
      `${contract.holderFirstName ?? ''} ${contract.holderLastName ?? ''}`.trim(),
    payerFullName: formatPayerLabel(contract),
    payerEmail: contract.payerEmail ?? null,
    holderEmail: contract.holderEmail,
    status: contract.status,
    statusLabel:
      subscriptionContractStatusLabels[contract.status] ?? contract.status,
    currentStep,
    totalSteps: SUBSCRIPTION_DOSSIER_STEPS.length,
    steps: SUBSCRIPTION_DOSSIER_STEPS,
    stepHint,
    createdAt: contract.createdAt,
    documentsDeposed: deposedCount,
    documentsRequired: requiredDocumentLabels.length,
    requiredDocumentLabels,
  }
}

const PENDING_STATUS_PRIORITY: Record<PendingSubscriptionStatus, number> = {
  en_attente_de_justificatif: 0,
  en_attente_de_signature_payeur: 1,
  signature_en_cours: 1,
  en_attente_paiement: 2,
  en_attente_de_validation_documentaire: 3,
  brouillon: 5,
}

function pendingStatusPriority(status: string): number {
  if (status in PENDING_STATUS_PRIORITY) {
    return PENDING_STATUS_PRIORITY[status as PendingSubscriptionStatus]
  }
  return 99
}

function comparePendingContracts(
  a: ContractResponse,
  b: ContractResponse,
): number {
  const priorityDiff =
    pendingStatusPriority(a.status) - pendingStatusPriority(b.status)
  if (priorityDiff !== 0) return priorityDiff
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}

export function findPendingSubscriptionContracts(
  contracts: ContractResponse[],
): ContractResponse[] {
  return contracts
    .filter((c) =>
      PENDING_SUBSCRIPTION_STATUSES.includes(c.status as PendingSubscriptionStatus),
    )
    .sort(comparePendingContracts)
}

export function findPendingSubscriptionContract(
  contracts: ContractResponse[],
): ContractResponse | null {
  return findPendingSubscriptionContracts(contracts)[0] ?? null
}

export function sortSubscriptionDossiersByRecency(
  views: SubscriptionDossierView[],
): SubscriptionDossierView[] {
  return [...views].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function sortSubscriptionDossiersForSelection(
  views: SubscriptionDossierView[],
): SubscriptionDossierView[] {
  return [...views].sort((a, b) => {
    const nameDiff = a.beneficiaryFirstName.localeCompare(
      b.beneficiaryFirstName,
      'fr',
    )
    if (nameDiff !== 0) return nameDiff
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export function sortSubscriptionDossiersByPriority(
  views: SubscriptionDossierView[],
): SubscriptionDossierView[] {
  return [...views].sort((a, b) => {
    const priorityDiff =
      pendingStatusPriority(a.status) - pendingStatusPriority(b.status)
    if (priorityDiff !== 0) return priorityDiff

    if (
      a.status === 'en_attente_de_justificatif' &&
      b.status === 'en_attente_de_justificatif' &&
      a.documentsRequired > 0 &&
      b.documentsRequired > 0
    ) {
      const aMissing = a.documentsRequired - a.documentsDeposed
      const bMissing = b.documentsRequired - b.documentsDeposed
      if (aMissing !== bMissing) return bMissing - aMissing
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export function dossierNeedsAction(dossier: SubscriptionDossierView): boolean {
  if (
    dossier.status === 'en_attente_de_justificatif' &&
    dossier.documentsDeposed < dossier.documentsRequired
  ) {
    return true
  }
  return (
    dossier.status === 'en_attente_de_signature_payeur' ||
    dossier.status === 'signature_en_cours' ||
    dossier.status === 'en_attente_paiement'
  )
}

export function dossierDetailPath(dossier: SubscriptionDossierView): string {
  switch (dossier.status) {
    case 'en_attente_paiement':
      return `/dossier/paiement?contractId=${dossier.contractId}`
    case 'en_attente_de_validation_documentaire':
    case 'actif':
      return `/dossier/validation?contractId=${dossier.contractId}`
    case 'en_attente_de_signature_payeur':
    case 'signature_en_cours':
      return `/dossier/signature?contractId=${dossier.contractId}`
    default:
      return `/dossier?contractId=${dossier.contractId}`
  }
}

export function formatDossierDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
