import type { Profile } from '../types/mobility'

export function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null
  const born = new Date(birthDate)
  if (Number.isNaN(born.getTime())) return null

  const today = new Date()
  let age = today.getFullYear() - born.getFullYear()
  const monthDiff = today.getMonth() - born.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < born.getDate())) {
    age -= 1
  }
  return age
}

/** Miroir du ProfileCalculatorService back. */
export function deduceProfileFromBirthDate(birthDate: string): Profile | null {
  const age = calculateAge(birthDate)
  if (age === null) return null

  if (age < 11) return 'junior'
  if (age < 18) return 'scolaire'
  if (age < 26) return 'etudiant'
  if (age >= 62) return 'senior'
  return 'adulte'
}
