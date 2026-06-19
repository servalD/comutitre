import {
  JUSTIFICATIF_TYPES,
  STATUS_LABELS,
  isYousignVerifiedType,
  type JustificatifResponse,
} from '../api/justificatifs'
import type { DocumentType } from './types/mobility'
import {
  contractCodeToProductType,
  DOCUMENT_TO_JUSTIFICATIF,
} from './subscription-advisor/contract-mapping'
import { productCatalog } from './subscription-advisor/catalog'

export type SlotDocumentStatus = 'pending' | 'neutral' | 'success'

export interface RequiredDocumentSlot {
  documentType: DocumentType
  justificatifType: string
  label: string
  upload: JustificatifResponse | null
  statusLabel: string
  documentStatus: SlotDocumentStatus
  canSelect: boolean
  isFilled: boolean
}

const UPLOAD_STATUS_PRIORITY: Record<string, number> = {
  accepte: 0,
  pre_qualifie: 1,
  en_cours_de_verification: 2,
  recu: 3,
  a_revoir: 4,
  refuse: 5,
  incomplet: 6,
  expire: 7,
}

function justificatifTypeLabel(type: string): string {
  return JUSTIFICATIF_TYPES.find((t) => t.value === type)?.label ?? type
}

function uploadPriority(status: string): number {
  return UPLOAD_STATUS_PRIORITY[status] ?? 99
}

function pickBestUpload(
  uploads: JustificatifResponse[],
  justificatifType: string,
): JustificatifResponse | null {
  const matching = uploads.filter((j) => j.type === justificatifType)
  if (matching.length === 0) return null

  return [...matching].sort((a, b) => {
    const priorityDiff =
      uploadPriority(a.status) - uploadPriority(b.status)
    if (priorityDiff !== 0) return priorityDiff
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })[0]!
}

function mapUploadToDocumentStatus(status: string): SlotDocumentStatus {
  if (status === 'accepte' || status === 'pre_qualifie') return 'success'
  if (status === 'en_cours_de_verification' || status === 'recu') return 'pending'
  return 'neutral'
}

function slotIsFilled(upload: JustificatifResponse | null): boolean {
  if (!upload) return false
  return upload.status !== 'refuse' && upload.status !== 'a_revoir'
}

function slotStatusLabel(
  upload: JustificatifResponse,
  justificatifType: string,
): string {
  if (
    upload.status === 'en_cours_de_verification' &&
    !isYousignVerifiedType(justificatifType)
  ) {
    return 'Analyse automatique en cours…'
  }
  return STATUS_LABELS[upload.status] ?? upload.status
}

function slotCanSelect(upload: JustificatifResponse | null): boolean {
  if (!upload) return true
  return (
    upload.status === 'a_revoir' ||
    upload.status === 'refuse' ||
    upload.status === 'incomplet'
  )
}

export function requiredDocumentTypesForProduct(
  productCode: string,
): DocumentType[] {
  const productType = contractCodeToProductType(productCode)
  if (!productType) return []
  return productCatalog[productType].documents
}

export function buildRequiredDocumentSlots(
  productCode: string,
  uploads: JustificatifResponse[] = [],
): RequiredDocumentSlot[] {
  const documentTypes = requiredDocumentTypesForProduct(productCode)
  const seenTypes = new Set<string>()

  return documentTypes
    .map((documentType) => {
      const justificatifType = DOCUMENT_TO_JUSTIFICATIF[documentType]
      if (!justificatifType) return null

      if (seenTypes.has(justificatifType)) return null
      seenTypes.add(justificatifType)

      const upload = pickBestUpload(uploads, justificatifType)
      const isFilled = slotIsFilled(upload)

      return {
        documentType,
        justificatifType,
        label: justificatifTypeLabel(justificatifType),
        upload,
        statusLabel: upload
          ? slotStatusLabel(upload, justificatifType)
          : 'À fournir',
        documentStatus: upload
          ? mapUploadToDocumentStatus(upload.status)
          : 'neutral',
        canSelect: slotCanSelect(upload),
        isFilled,
      }
    })
    .filter((slot): slot is RequiredDocumentSlot => slot !== null)
}

export function countFilledSlots(slots: RequiredDocumentSlot[]): number {
  return slots.filter((slot) => slot.isFilled).length
}

export function isSlotReadyForSignature(
  upload: JustificatifResponse | null,
): boolean {
  if (!upload) return false
  return upload.status === 'pre_qualifie' || upload.status === 'accepte'
}

export function countReadySlots(slots: RequiredDocumentSlot[]): number {
  return slots.filter((slot) => isSlotReadyForSignature(slot.upload)).length
}

export function allRequiredDocumentsReady(
  slots: RequiredDocumentSlot[],
): boolean {
  if (slots.length === 0) return false
  return slots.every((slot) => isSlotReadyForSignature(slot.upload))
}

export function requiredDocumentLabelsFromSlots(
  slots: RequiredDocumentSlot[],
): string[] {
  return slots.map((slot) => slot.label)
}

export function firstSelectableSlotType(
  slots: RequiredDocumentSlot[],
): string | null {
  const selectable = slots.find((slot) => slot.canSelect)
  return selectable?.justificatifType ?? null
}
