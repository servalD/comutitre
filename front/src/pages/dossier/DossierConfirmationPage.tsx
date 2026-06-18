import { Link } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { VirtualPassCard } from '../../components/dossier/VirtualPassCard'
import styles from './DossierConfirmationPage.module.css'

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#007D44" />
      <path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function DossierConfirmationPage() {
  return (
    <AppLayout activeTab="accueil">
      <div className={styles.page}>
        <div className={styles.confetti} aria-hidden="true">
          {Array.from({ length: 16 }).map((_, i) => (
            <span key={i} className={styles.confettiDot} style={{ '--i': i } as React.CSSProperties} />
          ))}
        </div>

        <div className={styles.hero}>
          <div className={styles.headerBranding}>
            <div className={styles.logoWrap} aria-label="Île-de-France Mobilités">
              <span className={styles.logoText}>île-de-France</span>
              <span className={styles.logoSub}>mobilités</span>
            </div>
          </div>

          <span className={styles.checkIcon} aria-hidden="true">
            <CheckCircleIcon />
          </span>

          <div className={styles.badge}>
            Titre actif
          </div>

          <h1 className={styles.title}>Imagine R Junior est actif !</h1>
          <p className={styles.subtitle}>
            Léa peut voyager dès maintenant sur le réseau Île-de-France.
          </p>
        </div>

        <div className={styles.cardWrap}>
          <VirtualPassCard
            holderName="Léa Dupont"
            product="Imagine R Junior"
            validity="Valide jusqu'au 31/08/2027"
          />
        </div>

        <div className={styles.actions}>
          <Link to="/foyer/2">
            <Button fullWidth>
              Voir mon titre
            </Button>
          </Link>
          <button type="button" className={styles.downloadBtn}>
            <DownloadIcon />
            Télécharger l'attestation
          </button>
        </div>

        <div className={styles.renewalBanner}>
          <span className={styles.renewalIcon} aria-hidden="true"><InfoIcon /></span>
          <p className={styles.renewalText}>Prochaine échéance : renouvellement dans 11 mois</p>
        </div>
      </div>
    </AppLayout>
  )
}
