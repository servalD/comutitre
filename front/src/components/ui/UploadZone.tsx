import { useTranslation } from 'react-i18next'
import styles from './UploadZone.module.css'

interface UploadZoneProps {
  onClick?: () => void
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export function UploadZone({ onClick }: UploadZoneProps) {
  const { t } = useTranslation('common')
  return (
    <button type="button" className={styles.zone} onClick={onClick}>
      <span className={styles.icon} aria-hidden="true">
        <CameraIcon />
      </span>
      <span className={styles.title}>{t('upload.title')}</span>
      <span className={styles.hint}>{t('upload.hint')}</span>
    </button>
  )
}
