import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/comutitres_v_couleur.svg'
import styles from './SubscriptionWizardShell.module.css'

interface SubscriptionWizardShellProps {
  children: ReactNode
  step: number
  totalSteps: number
  stepper: ReactNode
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function SubscriptionWizardShell({
  children,
  step,
  totalSteps,
  stepper,
}: SubscriptionWizardShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.closeBtn} aria-label="Fermer">
          <CloseIcon />
        </Link>
        <img src={logo} alt="Comutitres" className={styles.logo} />
        <span className={styles.headerSpacer} aria-hidden="true" />
      </header>

      <div className={styles.frame}>
        <div className={styles.intro}>
          <h1 className={styles.title}>Nouvelle souscription</h1>
          {stepper}
          <span className={styles.stepBadge}>
            Étape {step} sur {totalSteps}
          </span>
        </div>

        <main className={styles.main}>{children}</main>
      </div>
    </div>
  )
}
