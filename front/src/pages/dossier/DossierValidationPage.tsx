import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { contractsApi, type ContractResponse } from '../../api/contracts'
import { AppLayout } from '../../components/layout/AppLayout'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { Stepper } from '../../components/ui/Stepper'
import { ValidationTimeline } from '../../components/dossier/ValidationTimeline'
import { buildValidationTimelineItems } from '../../components/dossier/validation-timeline-items'
import { useAuth } from '../../contexts/AuthContext'
import styles from './DossierValidationPage.module.css'

const DOSSIER_STEPS = [
  { id: 1, label: 'Informations' },
  { id: 2, label: 'Justificatifs' },
  { id: 3, label: 'Signature' },
  { id: 4, label: 'Paiement' },
  { id: 5, label: 'Validation' },
]

function SandglassIllustration() {
  return (
    <svg viewBox="0 0 120 140" fill="none" aria-hidden="true" className={styles.illustration}>
      <ellipse cx="60" cy="70" rx="48" ry="48" fill="#EDF5FF" />
      <path d="M42 30h36v20L60 70 42 50z" fill="#1972D2" opacity="0.7" />
      <path d="M42 110h36V90L60 70 42 90z" fill="#1972D2" opacity="0.4" />
      <line x1="38" y1="30" x2="82" y2="30" stroke="#1972D2" strokeWidth="3" strokeLinecap="round" />
      <line x1="38" y1="110" x2="82" y2="110" stroke="#1972D2" strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="72" r="3" fill="#64B5F6" />
      <circle cx="60" cy="82" r="2" fill="#64B5F6" opacity="0.6" />
      <circle cx="55" cy="90" r="1.5" fill="#64B5F6" opacity="0.4" />
      <circle cx="65" cy="88" r="1.5" fill="#64B5F6" opacity="0.4" />
    </svg>
  )
}

function CheckIllustration() {
  return (
    <svg viewBox="0 0 120 140" fill="none" aria-hidden="true" className={styles.illustration}>
      <ellipse cx="60" cy="70" rx="48" ry="48" fill="#E8F5E9" />
      <circle cx="60" cy="70" r="28" stroke="#007D44" strokeWidth="3" />
      <path d="M48 70l8 8 16-16" stroke="#007D44" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function DossierValidationPage() {
  const { t } = useTranslation('dossier')
  const [searchParams] = useSearchParams()
  const contractId = searchParams.get('contractId') ?? ''
  const dossierLink = contractId ? `/dossier?contractId=${contractId}` : '/dossier'
  const { token } = useAuth()
  const navigate = useNavigate()
  const [contract, setContract] = useState<ContractResponse | null>(null)
  const [confirmingPayment, setConfirmingPayment] = useState(false)
  const [confirmingValidation, setConfirmingValidation] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [validationComplete, setValidationComplete] = useState(false)

  useEffect(() => {
    if (!token || !contractId) return

    let cancelled = false
    contractsApi
      .get(token, contractId)
      .then((c) => {
        if (cancelled) return
        setContract(c)
        if (c.status === 'actif') {
          setValidationComplete(true)
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [token, contractId])

  const needsDemoPaymentConfirm =
    contract &&
    (contract.status === 'actif' || contract.status === 'en_attente_paiement')

  const needsDemoValidationConfirm =
    contract &&
    !validationComplete &&
    contract.status === 'en_attente_de_validation_documentaire'

  const timelineItems = useMemo(
    () => buildValidationTimelineItems(validationComplete),
    [validationComplete],
  )

  async function handleDemoConfirmPayment() {
    if (!token || !contractId) return
    setConfirmingPayment(true)
    setActionError(null)
    try {
      const result = await contractsApi.confirmPayment(token, contractId)
      setContract((prev) =>
        prev ? { ...prev, status: result.status } : prev,
      )
      if (result.mobilityIdentityId) {
        navigate(`/foyer/${result.mobilityIdentityId}`, { replace: true })
      } else {
        window.location.reload()
      }
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Impossible de confirmer le paiement.',
      )
    } finally {
      setConfirmingPayment(false)
    }
  }

  async function handleDemoConfirmValidation() {
    if (!token || !contractId) return
    setConfirmingValidation(true)
    setActionError(null)
    try {
      const result = await contractsApi.confirmValidation(token, contractId)
      setValidationComplete(true)
      setContract((prev) =>
        prev ? { ...prev, status: result.status } : prev,
      )
      if (result.mobilityIdentityId) {
        navigate(`/foyer/${result.mobilityIdentityId}`, { replace: true })
      }
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Impossible de valider le dossier.',
      )
    } finally {
      setConfirmingValidation(false)
    }
  }

  return (
    <AppLayout activeTab="accueil">
      <div className={styles.page}>
        <PageHeader title={t('detail.title')} backTo={dossierLink} />

        <div className={styles.stepperWrap}>
          <Stepper steps={DOSSIER_STEPS} currentStep={validationComplete ? 5 : 4} />
        </div>

        <div className={styles.layout}>
          <div className={styles.hero}>
            {validationComplete ? <CheckIllustration /> : <SandglassIllustration />}
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                {validationComplete
                  ? 'Votre titre est activé'
                  : t('validation.heroTitle')}
              </h1>
              <p className={styles.heroSubtitle}>
                {validationComplete
                  ? 'Votre Imagine R est maintenant visible sur la fiche du bénéficiaire.'
                  : t('validation.heroSubtitle')}
              </p>
            </div>
          </div>

          <div className={styles.timeline}>
            <ValidationTimeline items={timelineItems} />
          </div>
        </div>

        <div className={styles.footer}>
          {needsDemoPaymentConfirm && (
            <div className={styles.demoConfirm}>
              <p className={styles.demoHint}>
                Paiement non enregistré — bouton réservé à la démo.
              </p>
              <Button
                variant="secondary"
                disabled={confirmingPayment || !token}
                onClick={() => void handleDemoConfirmPayment()}
              >
                {confirmingPayment ? 'Confirmation…' : 'Confirmer le paiement (démo)'}
              </Button>
            </div>
          )}

          {needsDemoValidationConfirm && (
            <div className={styles.demoConfirm}>
              <p className={styles.demoHint}>
                Simulez la validation par nos équipes et activez le titre sur le profil (démo).
              </p>
              {actionError ? (
                <p className={styles.demoError} role="alert">
                  {actionError}
                </p>
              ) : null}
              <Button
                variant="secondary"
                disabled={confirmingValidation || !token}
                onClick={() => void handleDemoConfirmValidation()}
              >
                {confirmingValidation ? 'Validation…' : 'Valider le dossier (démo)'}
              </Button>
            </div>
          )}

          {validationComplete && (
            <p className={styles.demoSuccess} role="status">
              Dossier validé — titre actif sur le profil.
            </p>
          )}

          <Link to="/espace">
            <Button>
              {t('validation.track')}
            </Button>
          </Link>
          <Link to="/aide" className={styles.helpLink}>
            {t('validation.helpLink')}
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
