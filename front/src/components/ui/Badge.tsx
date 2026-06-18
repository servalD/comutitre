import styles from './Badge.module.css'

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

interface BadgeProps {
  children: string
  tone?: Tone
  icon?: string
}

export function Badge({ children, tone = 'neutral', icon }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </span>
  )
}
