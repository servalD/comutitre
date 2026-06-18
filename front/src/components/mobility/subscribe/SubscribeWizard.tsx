import { useMemo, useState } from 'react'
import type { MobilityIdentity } from '../../../domain/types/mobility'
import {
  buildRecommendation,
  contractDatesForProduct,
  createSubscriptionContext,
  getAdvisorStep,
} from '../../../domain/subscription-advisor/advisor'
import type {
  QuestionId,
  SubscriptionAnswers,
  SubscriptionRecommendation,
} from '../../../domain/subscription-advisor/types'
import { mobilityApi } from '../../../api/mobility-api'
import { ApiError } from '../../../api/http-client'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { RecommendationCard } from './RecommendationCard'
import styles from './SubscribeWizard.module.css'

interface SubscribeWizardProps {
  identity: MobilityIdentity
  onCancel: () => void
}

export function SubscribeWizard({ identity, onCancel }: SubscribeWizardProps) {
  const context = useMemo(
    () =>
      createSubscriptionContext({
        identityId: identity.id,
        firstName: identity.firstName,
        lastName: identity.lastName,
        birthDate: identity.birthDate,
      }),
    [identity],
  )

  const [answers, setAnswers] = useState<SubscriptionAnswers>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const step = useMemo(() => getAdvisorStep(context, answers), [context, answers])

  const recommendation: SubscriptionRecommendation | null = useMemo(() => {
    if (!step.canRecommend) return null
    try {
      return buildRecommendation(context, answers)
    } catch {
      return null
    }
  }, [context, answers, step.canRecommend])

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

  function applyAnswer(questionId: QuestionId, value: string) {
    setError(null)
    setAnswers((prev) => {
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
          break
        case 'social_right_level':
          next.socialRightLevel = value as SubscriptionAnswers['socialRightLevel']
          break
        case 'has_navigo_card':
          next.hasNavigoCard = value === 'yes'
          break
      }
      return next
    })
  }

  function getSelectedValue(questionId: QuestionId): string | undefined {
    switch (questionId) {
      case 'is_enrolled':
        if (answers.isEnrolled === undefined) return undefined
        return answers.isEnrolled ? 'yes' : 'no'
      case 'has_scholarship':
        if (answers.hasScholarship === undefined) return undefined
        return answers.hasScholarship ? 'yes' : 'no'
      case 'travel_habit':
        return answers.travelHabit
      case 'social_right_level':
        return answers.socialRightLevel
      case 'has_navigo_card':
        if (answers.hasNavigoCard === undefined) return undefined
        return answers.hasNavigoCard ? 'yes' : 'no'
      default:
        return undefined
    }
  }

  async function handleSubscribe() {
    if (!recommendation) return
    setSubmitting(true)
    setError(null)
    try {
      const dates = contractDatesForProduct(recommendation.productType)
      await mobilityApi.createContract(identity.id, {
        productType: recommendation.productType,
        status: 'pending_document',
        validFrom: dates.validFrom,
        validTo: dates.validTo,
        currentTariff: recommendation.estimatedTariff,
      })

      for (const docType of recommendation.requiredDocuments) {
        await mobilityApi.createDocument(identity.id, { type: docType })
      }

      if (answers.hasNavigoCard === false) {
        await mobilityApi.createSupport(identity.id, {
          status: 'pending_activation',
        })
      }

      setDone(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Souscription impossible')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <Card className={styles.subscribe}>
        <p className={styles.success}>
          <span aria-hidden="true">✅</span> Dossier créé — déposez les justificatifs dans
          l’onglet Documents.
        </p>
        <Button onClick={onCancel}>Retour à la fiche</Button>
      </Card>
    )
  }

  const currentQuestion = step.questions[0]

  return (
    <div className={styles.subscribe}>
      <p className={styles.intro}>
        Nous vous guidons vers le forfait adapté à <strong>{identity.firstName}</strong>{' '}
        ({identity.calculatedAge} ans). Répondez aux questions — pas besoin de connaître le
        nom des passes à l’avance.
      </p>

      {currentQuestion ? (
        <Card className={styles.questionCard}>
          <p className={styles.questionLabel}>{currentQuestion.label}</p>
          {currentQuestion.hint ? (
            <p className={styles.hint}>{currentQuestion.hint}</p>
          ) : null}
          <fieldset className={styles.options}>
            <legend className="sr-only">{currentQuestion.label}</legend>
            {currentQuestion.options.map((option) => {
              const selected = getSelectedValue(currentQuestion.id) === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  className={[styles.option, selected ? styles.optionSelected : '']
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => applyAnswer(currentQuestion.id, option.value)}
                >
                  <span className={styles.optionLabel}>{option.label}</span>
                  {option.description ? (
                    <span className={styles.optionDesc}>{option.description}</span>
                  ) : null}
                </button>
              )
            })}
          </fieldset>
        </Card>
      ) : null}

      {blockingError ? <p className={styles.error}>{blockingError}</p> : null}

      {recommendation ? <RecommendationCard recommendation={recommendation} /> : null}

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        {recommendation ? (
          <Button onClick={handleSubscribe} disabled={submitting}>
            {submitting ? 'Création…' : 'Confirmer et ouvrir le dossier'}
          </Button>
        ) : null}
        <Button variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </div>
  )
}
