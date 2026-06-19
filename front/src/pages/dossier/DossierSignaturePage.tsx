import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { DossierSubStepper } from '../../components/dossier/DossierSubStepper'
import { DOSSIER_SUB_STEPS } from '../../data/mock'
import styles from './DossierSignaturePage.module.css'

function PdfIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function DossierSignaturePage() {
  const navigate = useNavigate()
  const [accepted, setAccepted] = useState(false)

  return (
    <AppLayout activeTab="accueil">
      <div className={styles.page}>
        <PageHeader title="Mon dossier" backTo="/dossier" />

        <div className={styles.stepperWrap}>
          <DossierSubStepper steps={DOSSIER_SUB_STEPS} currentStep={2} />
        </div>

        <div className={styles.layout}>
          <div className={styles.main}>
            <p className={styles.context}>
              En tant que payeur, vous devez signer les CGVU pour valider la souscription de Léa.
            </p>

            <button type="button" className={styles.pdfCard}>
              <span className={styles.pdfIcon} aria-hidden="true">
                <PdfIcon />
              </span>
              <div className={styles.pdfInfo}>
                <p className={styles.pdfTitle}>Conditions Générales de Vente et d'Utilisation</p>
                <p className={styles.pdfSize}>PDF — 8,4 Mo</p>
              </div>
              <ChevronRight />
            </button>

            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className={styles.checkbox}
              />
              <span>J'ai lu et j'accepte les CGVU</span>
            </label>

            <div className={styles.yousignBanner}>
              <span className={styles.yousignBadge}>
                <ShieldIcon />
                Signature électronique sécurisée
              </span>
              <span className={styles.yousignBrand}>via <strong>YouSign</strong></span>
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.recap}>
              <p className={styles.recapTitle}>Récapitulatif</p>
              <div className={styles.recapRow}>
                <span className={styles.recapLabel}>Forfait</span>
                <span className={styles.recapValue}>Imagine R Junior</span>
              </div>
              <div className={styles.recapRow}>
                <span className={styles.recapLabel}>Bénéficiaire</span>
                <span className={styles.recapValue}>Léa Dupont</span>
              </div>
              <div className={styles.recapRow}>
                <span className={styles.recapLabel}>Payeur</span>
                <span className={styles.recapValue}>Marie Dupont</span>
              </div>
              <div className={styles.recapRow}>
                <span className={styles.recapLabel}>Montant annuel</span>
                <span className={styles.recapValue}>384,00 €</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <Button fullWidth disabled={!accepted} onClick={() => navigate('/dossier/paiement')}>
            <ShieldIcon />
            Signer les CGVU
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
