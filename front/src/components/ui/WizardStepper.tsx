import { useTranslation } from 'react-i18next'
import styles from './WizardStepper.module.css'

interface WizardStepperProps {
  currentStep: number
  totalSteps: number
}

export function WizardStepper({ currentStep, totalSteps }: WizardStepperProps) {
  const { t } = useTranslation('common')
  return (
    <div
      className={styles.stepper}
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={t('stepOf', { step: currentStep, total: totalSteps })}
    >
      <div className={styles.track}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const step = index + 1
          const isDone = step < currentStep
          const isActive = step === currentStep
          const isLast = step === totalSteps

          return (
            <div key={step} className={styles.stepWrapper}>
              <div
                className={[
                  styles.dot,
                  isDone ? styles.done : '',
                  isActive ? styles.active : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {isDone && (
                  <svg viewBox="0 0 16 16" className={styles.check}>
                    <path
                      d="M3 8l3.5 3.5L13 5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              {!isLast && (
                <div
                  className={[
                    styles.connector,
                    isDone ? styles.connectorDone : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
