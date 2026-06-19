import type { ContractStatus, ProductType } from '../../domain/types/mobility'
import i18n from '../../i18n'
import { labelFor } from '../../constants/labels'
import {
  calculateAge,
  deduceProfileFromBirthDate,
} from '../../domain/mobility/profile-calculator'

export { calculateAge, deduceProfileFromBirthDate }

export function getActiveProductLabel(
  contracts: { productType: ProductType; status: ContractStatus }[],
): string | null {
  const active = contracts.find((c) => c.status === 'active')
  return active ? labelFor.product(active.productType) : null
}

export function formatEstimatedProfile(birthDate: string): string | null {
  const profile = deduceProfileFromBirthDate(birthDate)
  if (!profile) return null
  const age = calculateAge(birthDate)
  return `${labelFor.profile(profile)}${
    age !== null ? ` · ${i18n.t('identity.ageYears', { count: age, ns: 'mobility' })}` : ''
  }`
}
