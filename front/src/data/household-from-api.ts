import type { CharacterId } from '../components/ui/Avatar'
import {
  productLabels,
  profileLabels,
  relationshipLabels,
} from '../constants/labels'
import type {
  Contract,
  ContractStatus,
  MobilityIdentityWithRelationships,
  ProductType,
  RelationshipType,
} from '../domain/types/mobility'
import { MOCK_DOSSIER, MOCK_DOSSIER_MARIE, MOCK_HOUSEHOLD, MOCK_PERSON_JULES, MOCK_PERSON_LEA, MOCK_PERSON_MARIE, MOCK_SUBSCRIPTION, MOCK_USER } from './mock'
import type { SubscriptionDossierView } from '../domain/subscription-dossier'
import { sortSubscriptionDossiersByPriority } from '../domain/subscription-dossier'
import type { BeneficiaryChoice } from './mock'
import type { Profile } from '../domain/types/mobility'

import type { IdentityStatus } from '../domain/types/mobility'

export type DataSource = 'api' | 'mock' | 'none'

export interface HouseholdMemberView {
  id: string
  firstName: string
  lastName: string
  age: number
  role: string
  status: string
  isSelf: boolean
  identityStatus?: IdentityStatus
  character?: CharacterId
  avatarVariant?: 'default' | 'child'
}

const PENDING_CONTRACT_STATUSES: ContractStatus[] = [
  'draft',
  'pending_document',
  'pending_payer_signature',
  'pending_payment',
]

function hasActiveRelationship(
  identity: MobilityIdentityWithRelationships,
  type: RelationshipType,
): boolean {
  return identity.relationships.some(
    (rel) => rel.relationshipType === type && rel.status === 'active',
  )
}

function isOwner(identity: MobilityIdentityWithRelationships): boolean {
  return hasActiveRelationship(identity, 'owner')
}

export function mapIdentityRoleTag(
  identity: MobilityIdentityWithRelationships,
): string {
  if (hasActiveRelationship(identity, 'payer')) {
    return relationshipLabels.payer
  }
  if (identity.currentProfile === 'junior') {
    return profileLabels.junior
  }
  return profileLabels[identity.currentProfile]
}

export function mapContractsToStatusLabel(contracts: Contract[]): string {
  const active = contracts.find((c) => c.status === 'active')
  if (active) {
    return `${productLabels[active.productType]} actif`
  }

  const pending = contracts.find((c) =>
    PENDING_CONTRACT_STATUSES.includes(c.status),
  )
  if (pending) {
    return 'Dossier en cours'
  }

  return 'Aucun abonnement'
}

export function mapIdentityToMember(
  identity: MobilityIdentityWithRelationships,
  contracts: Contract[],
): HouseholdMemberView {
  const self = isOwner(identity)
  return {
    id: identity.id,
    firstName: identity.firstName,
    lastName: identity.lastName,
    age: identity.calculatedAge,
    role: mapIdentityRoleTag(identity),
    status: mapContractsToStatusLabel(contracts),
    isSelf: self,
    identityStatus: identity.status,
    avatarVariant: identity.calculatedAge < 18 ? 'child' : 'default',
  }
}

export function sortHouseholdMembers(
  members: HouseholdMemberView[],
): HouseholdMemberView[] {
  return [...members].sort((a, b) => {
    if (a.isSelf !== b.isSelf) return a.isSelf ? -1 : 1
    return b.age - a.age
  })
}

export function findOwnerFirstName(
  identities: MobilityIdentityWithRelationships[],
): string | null {
  const owner = identities.find(isOwner)
  return owner?.firstName ?? null
}

export function mockHouseholdMembers(): HouseholdMemberView[] {
  return MOCK_HOUSEHOLD.map((m) => ({ ...m }))
}

export function mockSubscriptionDossierViews(): SubscriptionDossierView[] {
  const jules: SubscriptionDossierView = {
    contractId: 'mock-contract-jules',
    product: MOCK_DOSSIER.product,
    productCode: 'imagine_r_scolaire',
    beneficiaryFirstName: MOCK_DOSSIER.beneficiaryFirstName,
    beneficiaryFullName: MOCK_DOSSIER.beneficiaryFullName,
    payerFullName: `${MOCK_USER.firstName} ${MOCK_USER.lastName}`,
    payerEmail: 'marie.dupont@email.fr',
    holderEmail: 'jules.dupont@email.fr',
    status: 'en_attente_de_justificatif',
    statusLabel: 'Justificatifs à déposer',
    currentStep: MOCK_DOSSIER.currentStep,
    totalSteps: MOCK_DOSSIER.totalSteps,
    steps: MOCK_DOSSIER.steps,
    stepHint: '1/3 documents déposés — complétez vos justificatifs.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    documentsDeposed: 1,
    documentsRequired: 3,
    requiredDocumentLabels: [
      "Pièce d'identité",
      'Photo',
      'Certificat scolaire',
    ],
  }

  const marie: SubscriptionDossierView = {
    contractId: 'mock-contract-marie',
    product: MOCK_DOSSIER_MARIE.product,
    productCode: 'navigo_annuel',
    beneficiaryFirstName: MOCK_DOSSIER_MARIE.beneficiaryFirstName,
    beneficiaryFullName: MOCK_DOSSIER_MARIE.beneficiaryFullName,
    payerFullName: `${MOCK_USER.firstName} ${MOCK_USER.lastName}`,
    payerEmail: 'marie.dupont@email.fr',
    holderEmail: 'marie.dupont@email.fr',
    status: MOCK_DOSSIER_MARIE.status,
    statusLabel: MOCK_DOSSIER_MARIE.statusLabel,
    currentStep: MOCK_DOSSIER_MARIE.currentStep,
    totalSteps: MOCK_DOSSIER.totalSteps,
    steps: MOCK_DOSSIER.steps,
    stepHint: 'Signez les CGVU et finalisez le paiement.',
    createdAt: new Date().toISOString(),
    documentsDeposed: MOCK_DOSSIER_MARIE.documentsDeposed,
    documentsRequired: MOCK_DOSSIER_MARIE.documentsRequired,
    requiredDocumentLabels: [
      "Pièce d'identité",
      'Justificatif de domicile',
      'RIB',
    ],
  }

  return sortSubscriptionDossiersByPriority([jules, marie])
}

export function mockSubscriptionDossierView(): SubscriptionDossierView {
  return mockSubscriptionDossierViews()[0]!
}

/** @deprecated use mockSubscriptionDossierView */
export function mockDossierView(): SubscriptionDossierView {
  return mockSubscriptionDossierView()
}

export function mockGreetingFirstName(): string {
  return MOCK_USER.firstName
}

export function greetingFromDisplayName(displayName: string | null): string | null {
  if (!displayName?.trim()) return null
  return displayName.trim().split(/\s+/)[0] ?? null
}

export interface SubscriptionBeneficiaryView {
  id: string
  firstName: string
  lastName: string
  birthDate: string
  age: number
  isSelf: boolean
  currentProfile: Profile
  productCategory: BeneficiaryChoice
}

export function productCategoryForIdentity(
  identity: MobilityIdentityWithRelationships,
): BeneficiaryChoice {
  if (isOwner(identity)) return 'self'
  if (identity.calculatedAge < 18) return 'child'
  return 'other'
}

export function mapIdentityToSubscriptionBeneficiary(
  identity: MobilityIdentityWithRelationships,
): SubscriptionBeneficiaryView {
  return {
    id: identity.id,
    firstName: identity.firstName,
    lastName: identity.lastName,
    birthDate: identity.birthDate,
    age: identity.calculatedAge,
    isSelf: isOwner(identity),
    currentProfile: identity.currentProfile,
    productCategory: productCategoryForIdentity(identity),
  }
}

export function mapIdentitiesToSubscriptionBeneficiaries(
  identities: MobilityIdentityWithRelationships[],
): SubscriptionBeneficiaryView[] {
  const mapped = identities.map(mapIdentityToSubscriptionBeneficiary)
  return [...mapped].sort((a, b) => {
    if (a.isSelf !== b.isSelf) return a.isSelf ? -1 : 1
    return b.age - a.age
  })
}

export type PersonTitreStatusType = 'active' | 'pending' | 'neutral'

export interface PersonTitreView {
  label: string
  validity: string
  status: string
  statusType: PersonTitreStatusType
  productType?: ProductType
}

export interface PersonDetailView {
  id: string
  firstName: string
  lastName: string
  age: number
  profile: string
  character?: CharacterId
  roles: {
    porteurLabel: string
    payeur: { name: string; isSelf: boolean }
    responsableLegal: { name: string; isSelf?: boolean }
  }
  ageBascule: string | null
  titre: PersonTitreView | null
}

export type PersonDetailSection = 'profile' | 'roles' | 'titre' | 'ageBascule'

function findOwnerIdentity(
  identities: MobilityIdentityWithRelationships[],
): MobilityIdentityWithRelationships | undefined {
  return identities.find(isOwner)
}

function pickPrimaryContract(contracts: Contract[]): Contract | null {
  return (
    contracts.find((c) => c.status === 'active') ??
    contracts.find((c) => PENDING_CONTRACT_STATUSES.includes(c.status)) ??
    contracts[0] ??
    null
  )
}

function contractToTitreStatusType(status: ContractStatus): PersonTitreStatusType {
  if (status === 'active') return 'active'
  if (PENDING_CONTRACT_STATUSES.includes(status)) return 'pending'
  return 'neutral'
}

export function mapContractToPersonTitre(contract: Contract): PersonTitreView {
  const statusType = contractToTitreStatusType(contract.status)
  const label = productLabels[contract.productType]
  const pendingLabel =
    contract.status === 'pending_document'
      ? 'Validation par nos équipes'
      : 'Dossier en cours'

  return {
    label,
    validity: 'Valable en Île-de-France',
    status:
      statusType === 'active'
        ? `${label} actif`
        : statusType === 'pending'
          ? pendingLabel
          : mapContractsToStatusLabel([contract]),
    statusType,
    productType: contract.productType,
  }
}

export function ageBasculeMessage(profile: Profile, age: number): string | null {
  if (profile === 'junior' && age < 11) {
    return 'Bascule Scolaire prévue à 11 ans'
  }
  if (profile === 'scolaire' && age >= 16) {
    return 'Compte Connect récupérable — passation disponible'
  }
  if (profile === 'scolaire' && age < 15) {
    return 'Compte Connect disponible à 15 ans'
  }
  if (profile === 'adulte' && age >= 16 && age < 62) {
    return 'Navigo Senior à 62 ans'
  }
  return null
}

function mockPersonFromLegacy(
  legacy: typeof MOCK_PERSON_LEA | typeof MOCK_PERSON_MARIE | typeof MOCK_PERSON_JULES,
): PersonDetailView {
  return {
    id: legacy.id,
    firstName: legacy.firstName,
    lastName: legacy.lastName,
    age: legacy.age,
    profile: legacy.profile,
    character: legacy.character,
    roles: {
      porteurLabel: legacy.roles.porteur.label,
      payeur: {
        name: legacy.roles.payeur.name,
        isSelf: legacy.roles.payeur.isSelf,
      },
      responsableLegal: {
        name: legacy.roles.responsableLegal.name,
        isSelf: legacy.roles.responsableLegal.isSelf,
      },
    },
    ageBascule: legacy.ageBascule,
    titre: legacy.titre,
  }
}

export function mockPersonDetailById(id: string | undefined): PersonDetailView {
  if (id === MOCK_PERSON_MARIE.id) {
    return mockPersonFromLegacy(MOCK_PERSON_MARIE)
  }
  if (id === MOCK_PERSON_JULES.id || id === MOCK_PERSON_LEA.id) {
    return mockPersonFromLegacy(MOCK_PERSON_JULES)
  }

  const member = MOCK_HOUSEHOLD.find((m) => m.id === id)
  if (member?.isSelf) {
    return mockPersonFromLegacy(MOCK_PERSON_MARIE)
  }
  if (member) {
    return mockPersonFromLegacy(MOCK_PERSON_JULES)
  }

  return mockPersonFromLegacy(MOCK_PERSON_JULES)
}

export function mockPersonDetailByProfile(input: {
  firstName: string
  isSelf?: boolean
}): PersonDetailView {
  const first = input.firstName.trim().toLowerCase()
  if (first === 'marie' || input.isSelf) {
    return mockPersonFromLegacy(MOCK_PERSON_MARIE)
  }
  if (first === 'jules') {
    return mockPersonFromLegacy(MOCK_PERSON_JULES)
  }
  return mockPersonFromLegacy(MOCK_PERSON_JULES)
}

export function mapIdentityToPersonDetail(
  identity: MobilityIdentityWithRelationships,
  allIdentities: MobilityIdentityWithRelationships[],
  contracts: Contract[],
): PersonDetailView {
  const owner = findOwnerIdentity(allIdentities)
  const ownerName = owner
    ? `${owner.firstName} ${owner.lastName}`
    : 'Responsable du compte'
  const self = isOwner(identity)
  const isMinor = identity.calculatedAge < 18
  const primaryContract = pickPrimaryContract(contracts)

  return {
    id: identity.id,
    firstName: identity.firstName,
    lastName: identity.lastName,
    age: identity.calculatedAge,
    profile: profileLabels[identity.currentProfile],
    character: self ? 'marie' : identity.calculatedAge < 18 ? 'lea' : undefined,
    roles: {
      porteurLabel: identity.firstName,
      payeur: self
        ? { name: `${identity.firstName} ${identity.lastName}`, isSelf: true }
        : { name: ownerName, isSelf: true },
      responsableLegal: isMinor
        ? { name: ownerName, isSelf: !self }
        : { name: `${identity.firstName} ${identity.lastName}`, isSelf: self },
    },
    ageBascule: ageBasculeMessage(identity.currentProfile, identity.calculatedAge),
    titre: primaryContract ? mapContractToPersonTitre(primaryContract) : null,
  }
}

export function mockSubscriptionBeneficiaries(): SubscriptionBeneficiaryView[] {
  return mockHouseholdMembers().map((member) => {
    const birthDate =
      member.id === '2'
        ? MOCK_SUBSCRIPTION.beneficiaryForm.birthDate
        : '1991-03-15'
    const currentProfile: Profile =
      member.age >= 18 ? 'adulte' : member.age >= 12 ? 'scolaire' : 'junior'

    return {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      birthDate,
      age: member.age,
      isSelf: member.isSelf,
      currentProfile,
      productCategory: member.isSelf
        ? 'self'
        : member.age < 18
          ? 'child'
          : 'other',
    }
  })
}
