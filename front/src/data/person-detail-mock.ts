import type { ProductType } from '../domain/types/mobility'
import type { CharacterId } from '../components/ui/Avatar'

export type PersonTitreStatusType = 'active' | 'pending' | 'neutral'

export type PersonMockScenario = 'marie' | 'jules' | 'default'

export interface PersonTitreListItem {
  id: string
  label: string
  validity: string
  status: string
  statusType: PersonTitreStatusType
  productType?: ProductType
  period?: string
}

export interface PersonDocumentListItem {
  id: string
  label: string
  status: 'accepted' | 'pending' | 'refused' | 'missing'
  statusLabel: string
  uploadedAt?: string
}

export interface PersonHistoryListItem {
  id: string
  label: string
  date: string
  done?: boolean
  active?: boolean
}

export function resolvePersonMockScenario(input: {
  firstName: string
  lastName?: string
  isSelf?: boolean
  age?: number
}): PersonMockScenario {
  const first = input.firstName.trim().toLowerCase()
  if (first === 'marie' || input.isSelf) return 'marie'
  if (first === 'jules') return 'jules'
  if ((input.age ?? 0) >= 16) return 'jules'
  return 'default'
}

export const MOCK_PERSON_JULES = {
  id: '2',
  firstName: 'Jules',
  lastName: 'Dupont',
  birthDate: '2009-06-12',
  age: 17,
  profile: 'Scolaire',
  character: 'lea' as CharacterId,
  roles: {
    porteur: { name: 'Jules', label: 'Jules' },
    payeur: { name: 'Marie Dupont', label: 'Marie Dupont', isSelf: false },
    responsableLegal: { name: 'Marie Dupont', isSelf: false },
  },
  ageBascule: 'Compte Connect récupérable — passation disponible',
  titre: {
    label: 'Imagine R Scolaire',
    validity: 'Valable en Île-de-France',
    status: 'Imagine R Scolaire actif',
    statusType: 'active' as const,
    productType: 'imagine_r_scolaire' as const,
  },
}

export const MOCK_PERSON_TITRES: Record<PersonMockScenario, PersonTitreListItem[]> = {
  marie: [
    {
      id: 'navigo-1',
      label: 'Navigo Annuel',
      validity: 'Valable en Île-de-France',
      status: 'Actif',
      statusType: 'active',
      productType: 'navigo_annuel',
      period: 'Sept. 2025 — Août 2026',
    },
  ],
  jules: [
    {
      id: 'ir-scolaire-1',
      label: 'Imagine R Scolaire',
      validity: 'Valable en Île-de-France',
      status: 'Actif',
      statusType: 'active',
      productType: 'imagine_r_scolaire',
      period: 'Sept. 2025 — Juin 2026',
    },
    {
      id: 'ir-junior-arch',
      label: 'Imagine R Junior',
      validity: 'Valable en Île-de-France',
      status: 'Expiré',
      statusType: 'neutral',
      productType: 'imagine_r_junior',
      period: '2020 — 2023',
    },
  ],
  default: [
    {
      id: 'default-1',
      label: 'Imagine R Scolaire',
      validity: 'Valable en Île-de-France',
      status: 'Dossier en cours',
      statusType: 'pending',
      productType: 'imagine_r_scolaire',
    },
  ],
}

export const MOCK_PERSON_DOCUMENTS: Record<PersonMockScenario, PersonDocumentListItem[]> = {
  marie: [
    {
      id: 'id-card',
      label: "Pièce d'identité",
      status: 'accepted',
      statusLabel: 'Accepté',
      uploadedAt: '12/09/2024',
    },
    {
      id: 'address',
      label: 'Justificatif de domicile',
      status: 'accepted',
      statusLabel: 'Accepté',
      uploadedAt: '12/09/2024',
    },
  ],
  jules: [
    {
      id: 'id-card',
      label: "Pièce d'identité",
      status: 'accepted',
      statusLabel: 'Accepté',
      uploadedAt: '03/09/2025',
    },
    {
      id: 'school',
      label: 'Certificat de scolarité',
      status: 'accepted',
      statusLabel: 'Accepté',
      uploadedAt: '05/09/2025',
    },
    {
      id: 'photo',
      label: "Photo d'identité",
      status: 'accepted',
      statusLabel: 'Acceptée',
      uploadedAt: '05/09/2025',
    },
    {
      id: 'scholarship',
      label: 'Attestation bourse',
      status: 'pending',
      statusLabel: 'En vérification',
      uploadedAt: '10/09/2025',
    },
  ],
  default: [
    {
      id: 'school',
      label: 'Certificat de scolarité',
      status: 'missing',
      statusLabel: 'Manquant',
    },
  ],
}

export const MOCK_PERSON_HISTORIQUE: Record<PersonMockScenario, PersonHistoryListItem[]> = {
  marie: [
    { id: 'h1', label: 'Compte Connect créé', date: '15/03/2018', done: true },
    { id: 'h2', label: 'Navigo Annuel souscrit', date: '01/09/2025', done: true },
    { id: 'h3', label: 'Jules ajouté au foyer', date: '12/06/2020', done: true },
  ],
  jules: [
    { id: 'h1', label: 'Identité créée par Marie Dupont', date: '12/06/2020', done: true },
    { id: 'h2', label: 'Imagine R Junior souscrit', date: '01/09/2020', done: true },
    { id: 'h3', label: 'Bascule Scolaire (11 ans)', date: '12/06/2021', done: true },
    { id: 'h4', label: 'Imagine R Scolaire souscrit', date: '01/09/2024', done: true },
    { id: 'h5', label: 'Justificatif scolaire validé', date: '08/09/2025', done: true },
    {
      id: 'h6',
      label: 'Passation de compte disponible — en attente',
      date: 'En cours',
      done: false,
      active: true,
    },
  ],
  default: [
    { id: 'h1', label: 'Identité créée', date: '—', done: true },
    { id: 'h2', label: 'Dossier en cours de traitement', date: 'En cours', active: true },
  ],
}

export function getPersonDetailMocks(scenario: PersonMockScenario) {
  return {
    titres: MOCK_PERSON_TITRES[scenario],
    documents: MOCK_PERSON_DOCUMENTS[scenario],
    historique: MOCK_PERSON_HISTORIQUE[scenario],
  }
}
