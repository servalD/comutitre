import styles from './Stepper.module.css'

export interface StepperStep {
  id: number
  label: string
}

interface StepperProps {
  steps: StepperStep[]
  currentStep: number
  compact?: boolean
}

export function Stepper({ steps, currentStep, compact = false }: StepperProps) {
  return (
    <div className={[styles.stepper, compact ? styles.compact : ''].join(' ')}>
      <div className={styles.track}>
        {steps.map((step, index) => {
          const isDone = step.id < currentStep
          const isActive = step.id === currentStep
          const isLast = index === steps.length - 1

          return (
            <div key={step.id} className={styles.stepWrapper}>
              <div className={styles.stepContent}>
                <div
                  className={[
                    styles.circle,
                    isDone ? styles.done : '',
                    isActive ? styles.active : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {isDone ? (
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
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                {!compact && (
                  <span
                    className={[
                      styles.label,
                      isActive ? styles.labelActive : '',
                      isDone ? styles.labelDone : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {step.label}
                  </span>
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
