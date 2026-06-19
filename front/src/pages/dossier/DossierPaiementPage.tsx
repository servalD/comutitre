import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { contractsApi, type ContractResponse } from '../../api/contracts'
import { AppLayout } from '../../components/layout/AppLayout'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { DossierSubStepper } from '../../components/dossier/DossierSubStepper'
import { useAuth } from '../../contexts/AuthContext'
import { DOSSIER_SUB_STEPS } from '../../data/mock'
import { productLabelFromContractCode } from '../../domain/subscription-dossier'
import styles from './DossierPaiementPage.module.css'

type PayMode = 'quarterly' | 'monthly'

function CardPayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function DossierPaiementPage() {
  const navigate = useNavigate()
  const { t } = useTranslation('dossier')
  const [searchParams] = useSearchParams()
  const contractId = searchParams.get('contractId') ?? ''
  const { token } = useAuth()
  const [payMode, setPayMode] = useState<PayMode>('quarterly')
  const [contract, setContract] = useState<ContractResponse | null>(null)
  const [loading, setLoading] = useState(!!contractId && !!token)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !contractId) return

    let cancelled = false
    contractsApi
      .get(token, contractId)
      .then((c) => {
        if (cancelled) return
        if (
          c.status === 'en_attente_de_validation_documentaire' ||
          c.status === 'actif'
        ) {
          navigate(`/dossier/validation?contractId=${contractId}`, {
            replace: true,
          })
          return
        }
        if (c.status !== 'en_attente_paiement') {
          navigate(`/dossier?contractId=${contractId}`, { replace: true })
          return
        }
        setContract(c)
      })
      .catch(() => {
        if (!cancelled) navigate('/dossier', { replace: true })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token, contractId, navigate])

  async function handlePay() {
    if (!token || !contractId) return
    setPaying(true)
    setPayError(null)
    try {
      const result = await contractsApi.confirmPayment(token, contractId)
      if (result.mobilityIdentityId) {
        navigate(`/foyer/${result.mobilityIdentityId}`)
      } else {
        navigate(`/dossier/validation?contractId=${contractId}`)
      }
    } catch (err) {
      setPayError(
        err instanceof Error ? err.message : 'Le paiement n\u2019a pas pu être confirmé.',
      )
      setPaying(false)
    }
  }

  const productLabel = contract
    ? productLabelFromContractCode(contract.productCode)
    : 'Imagine R Junior'
  const beneficiaryName = contract
    ? `${contract.holderFirstName ?? ''} ${contract.holderLastName ?? ''}`.trim()
    : '…'

  if (loading) {
    return (
      <AppLayout activeTab="accueil">
        <div className={styles.page}>
          <PageHeader title={t('paiement.title')} backTo="/dossier" />
          <p>Chargement…</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout activeTab="accueil">
      <div className={styles.page}>
        <PageHeader
          title={t('paiement.title')}
          subtitle={t('common:stepOf', { step: 4, total: 4 })}
          backTo={`/dossier/signature?contractId=${contractId}`}
        />

        <div className={styles.stepperWrap}>
          <DossierSubStepper steps={DOSSIER_SUB_STEPS} currentStep={3} />
        </div>

        <div className={styles.layout}>
          <div className={styles.main}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('paiement.choosePayMode')}</h2>
              <div className={styles.payModes}>
                <label className={[styles.payMode, payMode === 'quarterly' ? styles.payModeActive : ''].filter(Boolean).join(' ')}>
                  <input
                    type="radio"
                    name="payMode"
                    value="quarterly"
                    checked={payMode === 'quarterly'}
                    onChange={() => setPayMode('quarterly')}
                    className={styles.radioInput}
                  />
                  <div className={styles.payModeBody}>
                    <div className={styles.payModeTop}>
                      <span className={styles.payModeLabel}>{t('paiement.fourTimes')}</span>
                      <span className={styles.payModeBadge}>{t('paiement.fourInstalments')}</span>
                    </div>
                    <p className={styles.payModeDesc}>{t('paiement.fourInstalments')}</p>
                  </div>
                </label>

                <label className={[styles.payMode, payMode === 'monthly' ? styles.payModeActive : ''].filter(Boolean).join(' ')}>
                  <input
                    type="radio"
                    name="payMode"
                    value="monthly"
                    checked={payMode === 'monthly'}
                    onChange={() => setPayMode('monthly')}
                    className={styles.radioInput}
                  />
                  <div className={styles.payModeBody}>
                    <span className={styles.payModeLabel}>{t('paiement.monthly')}</span>
                    <p className={styles.payModeDesc}>{t('paiement.twelveInstalments')}</p>
                  </div>
                </label>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('paiement.paymentInfo')}</h2>
              <div className={styles.cardForm}>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel} htmlFor="cardNumber">{t('paiement.cardNumber')}</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon} aria-hidden="true"><CardPayIcon /></span>
                    <input
                      id="cardNumber"
                      type="text"
                      className={styles.input}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label className={styles.fieldLabel} htmlFor="expiry">{t('paiement.expiry')}</label>
                    <input id="expiry" type="text" className={styles.input} placeholder="MM / AA" maxLength={7} />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.fieldLabel} htmlFor="cvv">CVV</label>
                    <input id="cvv" type="text" className={styles.input} placeholder="123" maxLength={4} />
                  </div>
                </div>
              </div>

              <div className={styles.secureBadge}>
                <LockIcon />
                <span>{t('paiement.secure')}</span>
              </div>
            </section>
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.recap}>
              <div className={styles.recapProduct}>
                <div className={styles.recapVisual} aria-hidden="true">
                  <span className={styles.recapBrand}>imagine R</span>
                  <span className={styles.recapType}>Junior</span>
                </div>
                <div>
                  <p className={styles.recapName}>{productLabel}</p>
                  <p className={styles.recapBenef}>{beneficiaryName}</p>
                </div>
              </div>
              <div className={styles.recapTotal}>
                <span className={styles.recapTotalLabel}>{t('paiement.annualTotal')}</span>
                <span className={styles.recapTotalAmount}>384,00 €</span>
              </div>
              <p className={styles.recapNote}>{t('paiement.payerNote')}</p>
            </div>
          </aside>
        </div>

        <div className={styles.footer}>
          {payError ? (
            <p className={styles.payError} role="alert">
              {payError}
            </p>
          ) : null}
          <Button fullWidth disabled={paying || !token || !contractId} onClick={() => void handlePay()}>
            <LockIcon />
            {paying ? 'Confirmation…' : t('paiement.pay', { amount: '384 €' })}
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
