import type { DocumentType, ProductType, Profile } from '../types/mobility'

export type TravelHabit =
  | 'daily'
  | 'occasional'
  | 'social_rights'
  | 'department_assigned'

export type SocialRightLevel = 'gratuite' | 'solidarite_75' | 'reduction_50'

export interface SubscriptionContext {
  identityId: string
  firstName: string
  lastName: string
  birthDate: string
  age: number
  profile: Profile
}

export interface SubscriptionAnswers {
  isEnrolled?: boolean
  hasScholarship?: boolean
  travelHabit?: TravelHabit
  socialRightLevel?: SocialRightLevel
  hasNavigoCard?: boolean
}

export type QuestionId =
  | 'is_enrolled'
  | 'has_scholarship'
  | 'travel_habit'
  | 'social_right_level'
  | 'has_navigo_card'

export interface SubscriptionQuestion {
  id: QuestionId
  label: string
  hint?: string
  options: { value: string; label: string; description?: string }[]
}

export interface SubscriptionRecommendation {
  productType: ProductType
  productLabel: string
  summary: string
  why: string[]
  estimatedTariff: number
  tariffLabel: string
  requiredDocuments: DocumentType[]
  documentLabels: string[]
  alternatives?: { productLabel: string; reason: string }[]
  usageNote?: string
}

export interface AdvisorStep {
  questions: SubscriptionQuestion[]
  canRecommend: boolean
}
