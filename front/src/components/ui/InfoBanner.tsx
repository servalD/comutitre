import type { ReactNode } from 'react'
import styles from './InfoBanner.module.css'

interface InfoBannerProps {
  children: ReactNode
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function InfoBanner({ children }: InfoBannerProps) {
  return (
    <div className={styles.banner} role="note">
      <InfoIcon />
      <p>{children}</p>
    </div>
  )
}
