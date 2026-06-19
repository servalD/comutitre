import type { ReactNode } from 'react'
import styles from './Badge.module.css'

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'pending'

interface BadgeProps {
  children: ReactNode
  tone?: Tone
  icon?: ReactNode
}

export function Badge({ children, tone = 'neutral', icon }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      {icon ? <span className={styles.icon} aria-hidden="true">{icon}</span> : null}
      {children}
    </span>
  )
}
