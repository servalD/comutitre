import type { ValidationTimelineItem } from './validation-timeline-items'
import styles from './ValidationTimeline.module.css'

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={styles.spinner}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="20 18" />
    </svg>
  )
}

interface ValidationTimelineProps {
  items: ValidationTimelineItem[]
}

export function ValidationTimeline({ items }: ValidationTimelineProps) {
  return (
    <ol className={styles.timeline}>
      {items.map((item) => (
        <li key={item.id} className={[styles.item, item.done ? styles.done : '', item.active ? styles.active : ''].filter(Boolean).join(' ')}>
          <span className={styles.icon} aria-hidden="true">
            {item.done ? <CheckIcon /> : item.active ? <SpinnerIcon /> : null}
          </span>
          <div className={styles.body}>
            <span className={styles.label}>{item.label}</span>
            <span className={styles.date}>{item.date}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}
