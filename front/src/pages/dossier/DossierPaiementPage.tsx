import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { DossierSubStepper } from '../../components/dossier/DossierSubStepper'
import { DOSSIER_SUB_STEPS } from '../../data/mock'
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
  const [payMode, setPayMode] = useState<PayMode>('quarterly')

  return (
    <AppLayout activeTab="accueil">
      <div className={styles.page}>
        <PageHeader title="Paiement" subtitle="Étape 4 sur 4" backTo="/dossier/signature" />

        <div className={styles.stepperWrap}>
          <DossierSubStepper steps={DOSSIER_SUB_STEPS} currentStep={3} />
        </div>

        <div className={styles.layout}>
          <div className={styles.main}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Choisissez votre mode de paiement</h2>
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
                      <span className={styles.payModeLabel}>Paiement en 4 fois</span>
                      <span className={styles.payModeBadge}>4 prélèvements de 96,00 €</span>
                    </div>
                    <p className={styles.payModeDesc}>4 prélèvements de 96,00 €</p>
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
                    <span className={styles.payModeLabel}>Prélèvement mensuel</span>
                    <p className={styles.payModeDesc}>12 prélèvements de 32,00 €</p>
                  </div>
                </label>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Informations de paiement</h2>
              <div className={styles.cardForm}>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel} htmlFor="cardNumber">Numéro de carte</label>
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
                    <label className={styles.fieldLabel} htmlFor="expiry">Date d'expiration</label>
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
                <span>Paiement sécurisé (simulation)</span>
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
                  <p className={styles.recapName}>Imagine R Junior</p>
                  <p className={styles.recapBenef}>Léa Dupont</p>
                </div>
              </div>
              <div className={styles.recapTotal}>
                <span className={styles.recapTotalLabel}>Total annuel</span>
                <span className={styles.recapTotalAmount}>384,00 €</span>
              </div>
              <p className={styles.recapNote}>Le payeur sera débité chaque mois</p>
            </div>
          </aside>
        </div>

        <div className={styles.footer}>
          <Button fullWidth onClick={() => navigate('/dossier/validation')}>
            <LockIcon />
            Payer 384 €
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
