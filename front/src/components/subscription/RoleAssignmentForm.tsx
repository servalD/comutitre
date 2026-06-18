import { useState } from 'react'
import { InfoBanner } from '../ui/InfoBanner'
import styles from './RoleAssignmentForm.module.css'

interface RoleAssignmentFormProps {
  beneficiaryName: string
  payerName: string
  isMinor: boolean
}

export function RoleAssignmentForm({
  beneficiaryName,
  payerName,
  isMinor,
}: RoleAssignmentFormProps) {
  const [sameAsLegal, setSameAsLegal] = useState(true)

  return (
    <div className={styles.form}>
      {isMinor && (
        <InfoBanner>
          {beneficiaryName} est mineur(e). Un payeur et un responsable légal sont requis.
        </InfoBanner>
      )}

      <div className={styles.field}>
        <label className={styles.label}>Payeur</label>
        <div className={styles.select}>
          <span className={styles.selectValue}>{payerName} (vous)</span>
          <ChevronIcon />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Responsable légal</label>
        <div className={styles.select}>
          <span className={styles.selectValue}>{payerName} (vous)</span>
          <ChevronIcon />
        </div>
      </div>

      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={sameAsLegal}
          onChange={(e) => setSameAsLegal(e.target.checked)}
          className={styles.checkbox}
        />
        <span>Le payeur est aussi responsable légal</span>
      </label>

      <p className={styles.consent}>
        <span className={styles.consentIcon} aria-hidden="true">
          <ShieldIcon />
        </span>
        Le payeur accepte les{' '}
        <a href="#" className={styles.link}>
          conditions financières
        </a>{' '}
        et le prélèvement.
      </p>
    </div>
  )
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={styles.chevron}>
      <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
