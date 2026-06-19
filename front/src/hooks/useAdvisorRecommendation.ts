import { useMemo } from 'react'
import {
  buildRecommendation,
  createSubscriptionContext,
  getAdvisorStep,
} from '../domain/subscription-advisor/advisor'
import type { SubscriptionAnswers } from '../domain/subscription-advisor/types'
import type { SubscriptionBeneficiaryView } from '../data/household-from-api'

export function useAdvisorRecommendation(
  beneficiary: SubscriptionBeneficiaryView | undefined,
  answers: SubscriptionAnswers,
) {
  const context = useMemo(() => {
    if (!beneficiary) return null
    return createSubscriptionContext({
      identityId: beneficiary.id,
      firstName: beneficiary.firstName,
      lastName: beneficiary.lastName,
      birthDate: beneficiary.birthDate,
    })
  }, [beneficiary])

  const step = useMemo(() => {
    if (!context) return null
    return getAdvisorStep(context, answers)
  }, [context, answers])

  const recommendation = useMemo(() => {
    if (!context || !step?.canRecommend) return null
    try {
      return buildRecommendation(context, answers)
    } catch {
      return null
    }
  }, [context, answers, step?.canRecommend])

  return { context, step, recommendation }
}
