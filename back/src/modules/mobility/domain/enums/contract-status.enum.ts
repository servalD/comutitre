export enum ContractStatus {
  DRAFT = 'draft',
  PENDING_DOCUMENT = 'pending_document',
  PENDING_PAYMENT = 'pending_payment',
  PENDING_PAYER_SIGNATURE = 'pending_payer_signature',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  BLOCKED_UNPAID = 'blocked_unpaid',
}
