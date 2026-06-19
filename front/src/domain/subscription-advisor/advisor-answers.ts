import type { QuestionId, SubscriptionAnswers } from './types'

export function applyAdvisorAnswer(
  prev: SubscriptionAnswers,
  questionId: QuestionId,
  value: string,
): SubscriptionAnswers {
  const next = { ...prev }
  switch (questionId) {
    case 'is_enrolled':
      next.isEnrolled = value === 'yes'
      if (!next.isEnrolled) next.hasScholarship = undefined
      break
    case 'has_scholarship':
      next.hasScholarship = value === 'yes'
      break
    case 'travel_habit':
      next.travelHabit = value as SubscriptionAnswers['travelHabit']
      if (value !== 'social_rights') next.socialRightLevel = undefined
      if (value !== 'occasional') next.liberteSupport = undefined
      break
    case 'liberte_support':
      next.liberteSupport = value as SubscriptionAnswers['liberteSupport']
      break
    case 'social_right_level':
      next.socialRightLevel = value as SubscriptionAnswers['socialRightLevel']
      break
    case 'has_navigo_card':
      next.hasNavigoCard = value === 'yes'
      break
  }
  return next
}

export function getAdvisorSelectedValue(
  answers: SubscriptionAnswers,
  questionId: QuestionId,
): string | undefined {
  switch (questionId) {
    case 'is_enrolled':
      if (answers.isEnrolled === undefined) return undefined
      return answers.isEnrolled ? 'yes' : 'no'
    case 'has_scholarship':
      if (answers.hasScholarship === undefined) return undefined
      return answers.hasScholarship ? 'yes' : 'no'
    case 'travel_habit':
      return answers.travelHabit
    case 'liberte_support':
      return answers.liberteSupport
    case 'social_right_level':
      return answers.socialRightLevel
    case 'has_navigo_card':
      if (answers.hasNavigoCard === undefined) return undefined
      return answers.hasNavigoCard ? 'yes' : 'no'
    default:
      return undefined
  }
}

export function clearAdvisorAnswer(
  prev: SubscriptionAnswers,
  questionId: QuestionId,
): SubscriptionAnswers {
  const next = { ...prev }
  switch (questionId) {
    case 'is_enrolled':
      delete next.isEnrolled
      delete next.hasScholarship
      break
    case 'has_scholarship':
      delete next.hasScholarship
      break
    case 'travel_habit':
      delete next.travelHabit
      delete next.socialRightLevel
      delete next.liberteSupport
      break
    case 'liberte_support':
      delete next.liberteSupport
      break
    case 'social_right_level':
      delete next.socialRightLevel
      break
    case 'has_navigo_card':
      delete next.hasNavigoCard
      break
  }
  return next
}

export function seedAnswersFromUsage(
  prev: SubscriptionAnswers,
  profile: string,
  usageTravelHabit: SubscriptionAnswers['travelHabit'],
): SubscriptionAnswers {
  if (profile !== 'adulte' && profile !== 'senior') {
    return prev
  }
  if (prev.travelHabit) {
    return prev
  }
  return { ...prev, travelHabit: usageTravelHabit }
}
