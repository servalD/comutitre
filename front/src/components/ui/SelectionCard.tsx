import type { ReactNode } from 'react'
import styles from './SelectionCard.module.css'

interface SelectionCardProps {
  label: string
  icon: ReactNode
  selected?: boolean
  onClick?: () => void
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3 8l3.5 3.5L13 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SelectionCard({
  label,
  icon,
  selected = false,
  onClick,
}: SelectionCardProps) {
  return (
    <button
      type="button"
      className={[styles.card, selected ? styles.selected : ''].filter(Boolean).join(' ')}
      onClick={onClick}
      aria-pressed={selected}
    >
      {selected && (
        <span className={styles.check} aria-hidden="true">
          <CheckIcon />
        </span>
      )}
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.label}>{label}</span>
    </button>
  )
}
