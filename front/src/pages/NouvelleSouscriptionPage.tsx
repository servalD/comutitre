import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { contractsApi } from '../api/contracts'
import { SubscriptionWizardShell } from '../components/layout/SubscriptionWizardShell'
import { RecommendationView } from '../components/subscription/RecommendationView'
import { SubscriptionAdvisorStep } from '../components/subscription/SubscriptionAdvisorStep'
import { UsageSelectionCards } from '../components/subscription/UsageSelectionCards'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { InfoBanner } from '../components/ui/InfoBanner'
import { SelectionCard } from '../components/ui/SelectionCard'
import { WizardStepper } from '../components/ui/WizardStepper'
import { useAuth } from '../contexts/AuthContext'
import type { SubscriptionBeneficiaryView } from '../data/household-from-api'
import { MOCK_SUBSCRIPTION, type UsageOption } from '../data/mock'
import {
  applyAdvisorAnswer,
  clearAdvisorAnswer,
  getAdvisorSelectedValue,
  seedAnswersFromUsage,
} from '../domain/subscription-advisor/advisor-answers'
import {
  buildCreateContractPayload,
  usageToTravelHabit,
} from '../domain/subscription-advisor/contract-mapping'
import type {
  QuestionId,
  SubscriptionAnswers,
} from '../domain/subscription-advisor/types'
import { useSubscriptionBeneficiaries } from '../hooks/useSubscriptionBeneficiaries'
import { useAdvisorRecommendation } from '../hooks/useAdvisorRecommendation'
import styles from './NouvelleSouscriptionPage.module.css'

const ADD_PERSON_PATH = '/foyer/ajouter'
const RETURN_PATH = '/souscription/nouvelle'
const TOTAL_STEPS = 5

function SelfIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ChildIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M6 20c0-3.5 2.7-6 6-6s6 2.5 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function AddPersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function beneficiaryIcon(person: SubscriptionBeneficiaryView) {
  if (person.isSelf || person.age >= 18) return <SelfIcon />
  return <ChildIcon />
}

function beneficiaryLabel(person: SubscriptionBeneficiaryView) {
  const fullName = `${person.firstName} ${person.lastName}`
  return person.isSelf ? `${fullName} (Vous)` : fullName
}

export function NouvelleSouscriptionPage() {
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const { beneficiaries, loading, error } = useSubscriptionBeneficiaries()

  const defaultBeneficiary = beneficiaries.find((b) => b.isSelf) ?? beneficiaries[0]
  const ownerBeneficiary = beneficiaries.find((b) => b.isSelf) ?? defaultBeneficiary

  const [step, setStep] = useState(1)
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string | null>(null)
  const [usage, setUsage] = useState<UsageOption>('daily')
  const [answers, setAnswers] = useState<SubscriptionAnswers>({})
  const [advisorHistory, setAdvisorHistory] = useState<QuestionId[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const effectiveBeneficiaryId =
    selectedBeneficiaryId &&
    beneficiaries.some((person) => person.id === selectedBeneficiaryId)
      ? selectedBeneficiaryId
      : defaultBeneficiary?.id ?? null

  const selectedBeneficiary =
    beneficiaries.find((person) => person.id === effectiveBeneficiaryId) ??
    defaultBeneficiary

  const contactEmail = user?.email ?? MOCK_SUBSCRIPTION.beneficiaryForm.email

  const { step: advisorStep, recommendation } = useAdvisorRecommendation(
    selectedBeneficiary,
    answers,
  )

  const handleBeneficiaryChange = (person: SubscriptionBeneficiaryView) => {
    setSelectedBeneficiaryId(person.id)
    setAnswers({})
    setAdvisorHistory([])
    setSubmitError(null)
  }

  const goNext = () => {
    if (step === 3 && selectedBeneficiary) {
      setAnswers((prev) =>
        seedAnswersFromUsage(
          prev,
          selectedBeneficiary.currentProfile,
          usageToTravelHabit(usage),
        ),
      )
      setAdvisorHistory([])
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1))
  }

  const goBack = () => {
    setSubmitError(null)
    if (step === 4) {
      if (advisorHistory.length > 0) {
        const lastQuestion = advisorHistory[advisorHistory.length - 1]
        setAdvisorHistory((history) => history.slice(0, -1))
        setAnswers((prev) => clearAdvisorAnswer(prev, lastQuestion))
        return
      }
      setAnswers({})
      setAdvisorHistory([])
    }
    setStep((s) => Math.max(1, s - 1))
  }

  const handleAdvisorAnswer = (questionId: QuestionId, value: string) => {
    const hadAnswer = getAdvisorSelectedValue(answers, questionId) !== undefined
    setAnswers((prev) => applyAdvisorAnswer(prev, questionId, value))
    if (!hadAnswer) {
      setAdvisorHistory((history) => [...history, questionId])
    }
  }

  async function handleCreateContract() {
    if (!token || !recommendation || !selectedBeneficiary || !ownerBeneficiary) {
      return
    }
    const ownerEmail = user?.email
    if (!ownerEmail) {
      setSubmitError('Votre compte doit avoir une adresse e-mail pour souscrire.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      const payload = buildCreateContractPayload({
        recommendation,
        beneficiary: selectedBeneficiary,
        ownerEmail,
        ownerFirstName: ownerBeneficiary.firstName,
        ownerLastName: ownerBeneficiary.lastName,
      })
      const contract = await contractsApi.create(token, payload)
      navigate(`/dossier?contractId=${contract.id}`, {
        state: { recommendation },
      })
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Impossible de créer le dossier.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Pour qui souhaitez-vous souscrire ?'
      case 2:
        return 'Informations du bénéficiaire'
      case 3:
        return 'Quel est votre usage principal ?'
      case 4: {
        const currentQuestion = advisorStep?.questions[0]
        if (currentQuestion) return currentQuestion.label
        if (advisorStep?.canRecommend) return 'Situation complète'
        return 'Votre situation'
      }
      case 5:
        return 'Notre recommandation ✦'
      default:
        return ''
    }
  }

  const getStepSubtitle = () => {
    switch (step) {
      case 3:
        return 'Votre réponse nous aide à vous proposer les titres les plus adaptés à vos besoins.'
      case 4: {
        const currentQuestion = advisorStep?.questions[0]
        if (currentQuestion?.hint) return currentQuestion.hint
        if (advisorStep?.canRecommend) {
          return 'Vous pouvez passer à l’étape suivante pour voir notre recommandation.'
        }
        return 'Répondez à chaque question pour affiner le forfait proposé.'
      }
      default:
        return undefined
    }
  }

  const canContinueStep4 = advisorStep?.canRecommend ?? false

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            {error && (
              <p className={styles.loadError} role="status">
                {error} Affichage de démonstration.
              </p>
            )}
            {loading ? (
              <p className={styles.loadingHint}>Chargement de votre foyer…</p>
            ) : (
              <div className={styles.selectionGrid}>
                {beneficiaries.map((person) => (
                  <SelectionCard
                    key={person.id}
                    label={beneficiaryLabel(person)}
                    icon={beneficiaryIcon(person)}
                    selected={effectiveBeneficiaryId === person.id}
                    onClick={() => handleBeneficiaryChange(person)}
                  />
                ))}
                <SelectionCard
                  label="Ajouter une personne"
                  icon={<AddPersonIcon />}
                  selected={false}
                  onClick={() =>
                    navigate(ADD_PERSON_PATH, { state: { from: RETURN_PATH } })
                  }
                />
              </div>
            )}
            <InfoBanner>
              Le titulaire du compte connecté sera automatiquement payeur et
              responsable légal si le bénéficiaire est mineur.
            </InfoBanner>
          </>
        )

      case 2:
        return (
          <Card key={selectedBeneficiary?.id} className={styles.formCard}>
            <div className={styles.fieldGrid}>
              <label className={styles.field}>
                <span>Prénom</span>
                <input
                  type="text"
                  defaultValue={selectedBeneficiary?.firstName ?? ''}
                  readOnly
                />
              </label>
              <label className={styles.field}>
                <span>Nom</span>
                <input
                  type="text"
                  defaultValue={selectedBeneficiary?.lastName ?? ''}
                  readOnly
                />
              </label>
              <label className={styles.field}>
                <span>Date de naissance</span>
                <input
                  type="date"
                  defaultValue={selectedBeneficiary?.birthDate ?? ''}
                  readOnly
                />
              </label>
              <label className={styles.field}>
                <span>Email de contact</span>
                <input type="email" defaultValue={contactEmail} readOnly />
              </label>
            </div>
          </Card>
        )

      case 3:
        return <UsageSelectionCards selected={usage} onChange={setUsage} />

      case 4:
        return selectedBeneficiary ? (
          <SubscriptionAdvisorStep
            beneficiary={selectedBeneficiary}
            answers={answers}
            onAnswer={handleAdvisorAnswer}
          />
        ) : null

      case 5:
        return recommendation && selectedBeneficiary ? (
          <RecommendationView
            beneficiaryName={selectedBeneficiary.firstName}
            recommendation={recommendation}
            submitting={submitting}
            error={submitError}
            onContinue={() => void handleCreateContract()}
          />
        ) : (
          <p className={styles.loadingHint}>
            Impossible de calculer une recommandation. Revenez à l’étape précédente.
          </p>
        )

      default:
        return null
    }
  }

  const showDefaultFooter = step < 5

  return (
    <SubscriptionWizardShell
      step={step}
      totalSteps={TOTAL_STEPS}
      stepper={<WizardStepper currentStep={step} totalSteps={TOTAL_STEPS} />}
    >
      <div className={styles.page}>
        <div className={styles.content}>
          <div className={styles.stepHeader}>
            {step < TOTAL_STEPS && (
              <p className={styles.stepLabel}>
                Étape {step} sur {TOTAL_STEPS}
              </p>
            )}
            <h2
              id={step === 4 ? 'advisor-question' : undefined}
              className={styles.question}
            >
              {getStepTitle()}
            </h2>
            {getStepSubtitle() && (
              <p className={styles.stepSubtitle}>{getStepSubtitle()}</p>
            )}
          </div>

          {renderStep()}
        </div>

        {showDefaultFooter && (
          <footer className={styles.footer}>
            <Button
              fullWidth
              onClick={goNext}
              disabled={
                loading ||
                !selectedBeneficiary ||
                (step === 4 && !canContinueStep4)
              }
            >
              Continuer
            </Button>
            {step > 1 && (
              <button type="button" className={styles.backLink} onClick={goBack}>
                {step === 4 && advisorHistory.length > 0
                  ? 'Question précédente'
                  : 'Retour'}
              </button>
            )}
          </footer>
        )}
      </div>
    </SubscriptionWizardShell>
  )
}
