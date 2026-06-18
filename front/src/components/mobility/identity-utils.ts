import type { ContractStatus, ProductType } from '../../domain/types/mobility'
import { profileLabels, productLabels } from '../../constants/labels'
import {
  calculateAge,
  deduceProfileFromBirthDate,
} from '../../domain/mobility/profile-calculator'

export { calculateAge, deduceProfileFromBirthDate }

export function getActiveProductLabel(
  contracts: { productType: ProductType; status: ContractStatus }[],
): string | null {
  const active = contracts.find((c) => c.status === 'active')
  return active ? productLabels[active.productType] : null
}

export function formatEstimatedProfile(birthDate: string): string | null {
  const profile = deduceProfileFromBirthDate(birthDate)
  if (!profile) return null
  const age = calculateAge(birthDate)
  return `${profileLabels[profile]}${age !== null ? ` · ${age} ans` : ''}`
}
