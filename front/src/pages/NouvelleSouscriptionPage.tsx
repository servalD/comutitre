import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SubscriptionWizardShell } from '../components/layout/SubscriptionWizardShell'
import { RoleAssignmentForm } from '../components/subscription/RoleAssignmentForm'
import { UsageSelectionCards } from '../components/subscription/UsageSelectionCards'
import { RecommendationView } from '../components/subscription/RecommendationView'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { InfoBanner } from '../components/ui/InfoBanner'
import { SelectionCard } from '../components/ui/SelectionCard'
import { WizardStepper } from '../components/ui/WizardStepper'
import { useAuth } from '../contexts/AuthContext'
import type { SubscriptionBeneficiaryView } from '../data/household-from-api'
import {
  MOCK_SUBSCRIPTION,
  type BeneficiaryChoice,
  type SubscriptionProductId,
  type UsageOption,
} from '../data/mock'
import { useSubscriptionBeneficiaries } from '../hooks/useSubscriptionBeneficiaries'
import styles from './NouvelleSouscriptionPage.module.css'

const ADD_PERSON_PATH = '/mobility/new'
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

function getDefaultProductForCategory(
  category: BeneficiaryChoice,
  products: typeof MOCK_SUBSCRIPTION.products,
): SubscriptionProductId {
  const suggested = products.find((p) => p.forBeneficiary.includes(category))
  return suggested?.id ?? products[0].id
}

export function NouvelleSouscriptionPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { products } = MOCK_SUBSCRIPTION
  const { beneficiaries, loading, error } = useSubscriptionBeneficiaries()

  const defaultBeneficiary = beneficiaries.find((b) => b.isSelf) ?? beneficiaries[0]
  const ownerBeneficiary = beneficiaries.find((b) => b.isSelf) ?? defaultBeneficiary

  const [step, setStep] = useState(1)
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string | null>(null)
  const [productId, setProductId] = useState<SubscriptionProductId>(() =>
    getDefaultProductForCategory(
      defaultBeneficiary?.productCategory ?? 'self',
      products,
    ),
  )
  const [usage, setUsage] = useState<UsageOption>('daily')

  const effectiveBeneficiaryId =
    selectedBeneficiaryId &&
    beneficiaries.some((person) => person.id === selectedBeneficiaryId)
      ? selectedBeneficiaryId
      : defaultBeneficiary?.id ?? null

  const selectedBeneficiary =
    beneficiaries.find((person) => person.id === effectiveBeneficiaryId) ??
    defaultBeneficiary

  const contactEmail = user?.email ?? MOCK_SUBSCRIPTION.beneficiaryForm.email
  const isMinor = (selectedBeneficiary?.age ?? 18) < 18
  const payerName = ownerBeneficiary
    ? `${ownerBeneficiary.firstName} ${ownerBeneficiary.lastName}`
    : 'Marie Dupont'

  const handleBeneficiaryChange = (person: SubscriptionBeneficiaryView) => {
    setSelectedBeneficiaryId(person.id)
    setProductId(getDefaultProductForCategory(person.productCategory, products))
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
      case 4:
        return 'Votre réponse nous aide à vous proposer les titres les plus adaptés à vos besoins.'
      default:
        return undefined
    }
  }

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
              Si la personne est mineure, vous devrez renseigner le payeur.
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
        return (
          <RoleAssignmentForm
            beneficiaryName={selectedBeneficiary?.firstName ?? '—'}
            payerName={payerName}
            isMinor={isMinor}
          />
        )

      case 4:
        return <UsageSelectionCards selected={usage} onChange={setUsage} />

      case 5:
        return (
          <RecommendationView
            beneficiaryName={selectedBeneficiary?.firstName ?? '—'}
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
              <p className={styles.stepLabel}>
                Étape {step} sur {TOTAL_STEPS}
              </p>
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
            <Button
              fullWidth
              onClick={goNext}
              disabled={loading || !selectedBeneficiary}
            >
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
