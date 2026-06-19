import { useTranslation } from 'react-i18next'
import styles from './LanguageSwitcher.module.css'

const LANGUAGES = ['fr', 'en'] as const

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common')
  const current = i18n.resolvedLanguage ?? i18n.language

  return (
    <div className={styles.switcher} role="group" aria-label={t('language.label')}>
      {LANGUAGES.map((lng) => (
        <button
          key={lng}
          type="button"
          className={[styles.option, current === lng ? styles.optionActive : '']
            .filter(Boolean)
            .join(' ')}
          aria-pressed={current === lng}
          onClick={() => {
            void i18n.changeLanguage(lng)
          }}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
