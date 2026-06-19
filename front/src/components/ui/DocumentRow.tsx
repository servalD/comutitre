import type { ReactNode } from 'react'
import { Badge } from './Badge'
import styles from './DocumentRow.module.css'

export type DocumentStatus = 'pending' | 'neutral' | 'success'

interface DocumentRowProps {
  icon: ReactNode
  label: string
  status: DocumentStatus
  statusLabel: string
  onClick?: () => void
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 18l6-6-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const BADGE_VARIANT: Record<DocumentStatus, 'pending' | 'neutral' | 'success'> = {
  pending: 'pending',
  neutral: 'neutral',
  success: 'success',
}

export function DocumentRow({
  icon,
  label,
  status,
  statusLabel,
  onClick,
}: DocumentRowProps) {
  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={[styles.row, onClick ? styles.clickable : ''].filter(Boolean).join(' ')}
      onClick={onClick}
    >
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.label}>{label}</span>
      <Badge
        tone={BADGE_VARIANT[status]}
        icon={status === 'pending' ? <ClockIcon /> : undefined}
      >
        {statusLabel}
      </Badge>
      <ChevronRight />
    </Tag>
  )
}
