import { useTranslation } from 'react-i18next'
import styles from './DossierSubStepper.module.css'

interface Step {
  id: number
  label: string
}

interface DossierSubStepperProps {
  steps: Step[]
  currentStep: number
}

function CheckSmallIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function DossierSubStepper({ steps, currentStep }: DossierSubStepperProps) {
  const { t } = useTranslation('dossier')
  return (
    <nav className={styles.stepper} aria-label={t('subStepperAria')}>
      <ol className={styles.list}>
        {steps.map((step, index) => {
          const done = step.id < currentStep
          const active = step.id === currentStep

          return (
            <li key={step.id} className={[styles.item, done ? styles.done : '', active ? styles.active : ''].filter(Boolean).join(' ')}>
              <span className={styles.bubble} aria-hidden="true">
                {done ? <CheckSmallIcon /> : step.id}
              </span>
              <span className={styles.label}>{step.label}</span>
              {index < steps.length - 1 && (
                <span className={[styles.line, done ? styles.lineDone : ''].filter(Boolean).join(' ')} aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
