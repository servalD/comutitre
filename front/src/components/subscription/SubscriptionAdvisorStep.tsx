import { useMemo } from 'react'
import {
  buildRecommendation,
  createSubscriptionContext,
  getAdvisorStep,
} from '../../domain/subscription-advisor/advisor'
import { getAdvisorSelectedValue } from '../../domain/subscription-advisor/advisor-answers'
import type {
  QuestionId,
  SubscriptionAnswers,
  SubscriptionContext,
} from '../../domain/subscription-advisor/types'
import type { SubscriptionBeneficiaryView } from '../../data/household-from-api'
import styles from './SubscriptionAdvisorStep.module.css'

interface SubscriptionAdvisorStepProps {
  beneficiary: SubscriptionBeneficiaryView
  answers: SubscriptionAnswers
  onAnswer: (questionId: QuestionId, value: string) => void
}

export function SubscriptionAdvisorStep({
  beneficiary,
  answers,
  onAnswer,
}: SubscriptionAdvisorStepProps) {
  const context: SubscriptionContext = useMemo(
    () =>
      createSubscriptionContext({
        identityId: beneficiary.id,
        firstName: beneficiary.firstName,
        lastName: beneficiary.lastName,
        birthDate: beneficiary.birthDate,
      }),
    [beneficiary],
  )

  const step = useMemo(
    () => getAdvisorStep(context, answers),
    [context, answers],
  )

  const blockingError = useMemo(() => {
    if (step.questions.length > 0) return null
    if (step.canRecommend) return null
    if (answers.isEnrolled === false) {
      return 'Sans scolarité ou inscription, aucun forfait Imagine R ne correspond à cette situation.'
    }
    try {
      buildRecommendation(context, answers)
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Situation non couverte.'
    }
  }, [context, answers, step])

  const currentQuestion = step.questions[0]

  if (currentQuestion) {
    return (
      <div className={styles.root}>
        <fieldset className={styles.options} aria-labelledby="advisor-question">
          {currentQuestion.options.map((option) => {
            const selected =
              getAdvisorSelectedValue(answers, currentQuestion.id) === option.value
            return (
              <button
                key={option.value}
                type="button"
                className={[
                  styles.option,
                  selected ? styles.optionSelected : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onAnswer(currentQuestion.id, option.value)}
              >
                <span className={styles.optionLabel}>{option.label}</span>
                {option.description ? (
                  <span className={styles.optionDesc}>{option.description}</span>
                ) : null}
              </button>
            )
          })}
        </fieldset>
        {blockingError ? <p className={styles.error}>{blockingError}</p> : null}
      </div>
    )
  }

  if (step.canRecommend) {
    return null
  }

  return blockingError ? (
    <p className={styles.error}>{blockingError}</p>
  ) : null
}
