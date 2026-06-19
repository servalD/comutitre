import styles from './UsageSelectionCards.module.css'
import type { UsageOption } from '../../data/mock'
import { MOCK_USAGE_OPTIONS } from '../../data/mock'

interface UsageSelectionCardsProps {
  selected: UsageOption
  onChange: (value: UsageOption) => void
}

function MetroIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="8" y="14" width="32" height="20" rx="4" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="16" cy="30" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="32" cy="30" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M8 20h32" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="8" y="12" width="32" height="28" rx="3" stroke="currentColor" strokeWidth="2.5" />
      <path d="M8 20h32M16 8v8M32 8v8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="14" y="26" width="6" height="6" rx="1" fill="currentColor" />
    </svg>
  )
}

function TicketIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M6 16a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v4a4 4 0 0 0 0 8v4a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4v-4a4 4 0 0 0 0-8v-4z" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  )
}

const ICONS: Record<string, React.ReactNode> = {
  metro: <MetroIcon />,
  calendar: <CalendarIcon />,
  ticket: <TicketIcon />,
}

export function UsageSelectionCards({ selected, onChange }: UsageSelectionCardsProps) {
  return (
    <div className={styles.list}>
      {MOCK_USAGE_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          className={[styles.card, selected === option.id ? styles.selected : ''].filter(Boolean).join(' ')}
          onClick={() => onChange(option.id)}
          aria-pressed={selected === option.id}
        >
          <span className={styles.icon} aria-hidden="true">
            {ICONS[option.icon]}
          </span>
          <span className={styles.body}>
            <span className={styles.label}>{option.label}</span>
            <span className={styles.description}>{option.description}</span>
          </span>
          <span className={styles.radio} aria-hidden="true">
            {selected === option.id && <span className={styles.radioDot} />}
          </span>
        </button>
      ))}
    </div>
  )
}
