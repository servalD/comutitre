import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import styles from './PageHeader.module.css'

interface PageHeaderProps {
  title: string
  backTo?: string
  subtitle?: string
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M19 12H5M12 19l-7-7 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PageHeader({ title, backTo = '/', subtitle }: PageHeaderProps) {
  const { t } = useTranslation('common')
  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <Link to={backTo} className={styles.backBtn} aria-label={t('actions.back')}>
          <BackIcon />
        </Link>
        <h1 className={styles.title}>{title}</h1>
        <span className={styles.spacer} aria-hidden="true" />
      </div>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </header>
  )
}
