import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SubscriptionWizardShell } from '../components/layout/SubscriptionWizardShell'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SelectionCard } from '../components/ui/SelectionCard'
import { WizardStepper } from '../components/ui/WizardStepper'
import { RoleAssignmentForm } from '../components/subscription/RoleAssignmentForm'
import { UsageSelectionCards } from '../components/subscription/UsageSelectionCards'
import { RecommendationView } from '../components/subscription/RecommendationView'
import {
  MOCK_SUBSCRIPTION,
  type BeneficiaryChoice,
  type SubscriptionProductId,
  type UsageOption,
} from '../data/mock'
import styles from './NouvelleSouscriptionPage.module.css'

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

function OtherIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

const BENEFICIARY_ICONS = {
  self: <SelfIcon />,
  child: <ChildIcon />,
  other: <OtherIcon />,
}

function getDefaultProductForBeneficiary(
  beneficiary: BeneficiaryChoice,
  products: typeof MOCK_SUBSCRIPTION.products,
): SubscriptionProductId {
  const suggested = products.find((p) => p.forBeneficiary.includes(beneficiary))
  return suggested?.id ?? products[0].id
}

export function NouvelleSouscriptionPage() {
  const navigate = useNavigate()
  const { products, beneficiaryOptions, beneficiaryForm } = MOCK_SUBSCRIPTION

  const [step, setStep] = useState(1)
  const [beneficiary, setBeneficiary] = useState<BeneficiaryChoice>('child')
  const [productId, setProductId] = useState<SubscriptionProductId>('imagine-r-junior')
  const [usage, setUsage] = useState<UsageOption>('daily')

  const isMinor = beneficiary === 'child'

  const handleBeneficiaryChange = (choice: BeneficiaryChoice) => {
    setBeneficiary(choice)
    setProductId(getDefaultProductForBeneficiary(choice, products))
  }

  const goNext = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1))
  const goBack = () => setStep((s) => Math.max(1, s - 1))

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Pour qui souhaitez-vous souscrire ?'
      case 2: return 'Informations du bénéficiaire'
      case 3: return 'Rôles et responsabilités'
      case 4: return 'Quel est votre usage principal ?'
      case 5: return 'Notre recommandation ✦'
      default: return ''
    }
  }

  const getStepSubtitle = () => {
    switch (step) {
      case 4: return 'Votre réponse nous aide à vous proposer les titres les plus adaptés à vos besoins.'
      default: return undefined
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className={styles.selectionGrid}>
            {beneficiaryOptions.map((option) => (
              <SelectionCard
                key={option.id}
                label={option.label}
                icon={BENEFICIARY_ICONS[option.id]}
                selected={beneficiary === option.id}
                onClick={() => handleBeneficiaryChange(option.id)}
              />
            ))}
          </div>
        )

      case 2:
        return (
          <Card className={styles.formCard}>
            <div className={styles.fieldGrid}>
              <label className={styles.field}>
                <span>Prénom</span>
                <input type="text" defaultValue={beneficiaryForm.firstName} readOnly />
              </label>
              <label className={styles.field}>
                <span>Nom</span>
                <input type="text" defaultValue={beneficiaryForm.lastName} readOnly />
              </label>
              <label className={styles.field}>
                <span>Date de naissance</span>
                <input type="date" defaultValue={beneficiaryForm.birthDate} readOnly />
              </label>
            </div>
          </Card>
        )

      case 3:
        return (
          <RoleAssignmentForm
            beneficiaryName={beneficiaryForm.firstName}
            payerName="Marie Dupont"
            isMinor={isMinor}
          />
        )

      case 4:
        return (
          <UsageSelectionCards selected={usage} onChange={setUsage} />
        )

      case 5:
        return (
          <RecommendationView
            beneficiaryName={beneficiaryForm.firstName}
            selectedId={productId}
            onSelect={setProductId}
            onContinue={() => navigate('/dossier')}
          />
        )

      default:
        return null
    }
  }

  const showDefaultFooter = step < TOTAL_STEPS

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
              <p className={styles.stepLabel}>Étape {step} sur {TOTAL_STEPS}</p>
            )}
            <h2 className={styles.question}>{getStepTitle()}</h2>
            {getStepSubtitle() && (
              <p className={styles.stepSubtitle}>{getStepSubtitle()}</p>
            )}
          </div>

          {renderStep()}
        </div>

        {showDefaultFooter && (
          <footer className={styles.footer}>
            <Button fullWidth onClick={goNext}>
              Continuer
            </Button>
            {step > 1 && (
              <button type="button" className={styles.backLink} onClick={goBack}>
                Retour
              </button>
            )}
          </footer>
        )}
      </div>
    </SubscriptionWizardShell>
  )
}
