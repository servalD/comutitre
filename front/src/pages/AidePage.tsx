import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppLayout } from '../components/layout/AppLayout'
import { MOCK_HELP_CATEGORIES, MOCK_HELP_PROBLEMS } from '../data/mock'
import styles from './AidePage.module.css'

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.52 12 19.79 19.79 0 0 1 1.45 3.5 2 2 0 0 1 3.42 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.2a16 16 0 0 0 5.53 5.53l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CategoryIcon({ id }: { id: string }) {
  switch (id) {
    case 'perte-vol':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    case 'renouvellement':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M1 4v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'impaye':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'imagine-r':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M7 12h3m4-3v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'tst':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'contact-sav':
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    default:
      return null
  }
}

export function AidePage() {
  const { t } = useTranslation('foyer')
  const [query, setQuery] = useState('')

  const filteredCategories = MOCK_HELP_CATEGORIES.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <AppLayout activeTab="aide">
      <div className={styles.page}>
        <div className={styles.heroBar}>
          <h1 className={styles.title}>{t('aide.title')}</h1>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon} aria-hidden="true">
              <SearchIcon />
            </span>
            <input
              type="search"
              className={styles.searchInput}
              placeholder={t('aide.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t('aide.searchPlaceholder')}
            />
          </div>
        </div>

        <section className={styles.section} aria-labelledby="popular-heading">
          <h2 id="popular-heading" className={styles.sectionTitle}>{t('aide.popular')}</h2>
          <div className={styles.categoryGrid}>
            {filteredCategories.map((cat) => (
              <button key={cat.id} type="button" className={styles.categoryCard}>
                <span className={styles.catIcon} aria-hidden="true">
                  <CategoryIcon id={cat.id} />
                </span>
                <span className={styles.catLabel}>{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="problems-heading">
          <h2 id="problems-heading" className={styles.sectionTitle}>{t('aide.reportProblem')}</h2>
          <ul className={styles.problemList}>
            {MOCK_HELP_PROBLEMS.map((p) => (
              <li key={p.id}>
                <button type="button" className={styles.problemRow}>
                  <span className={styles.problemLabel}>{p.label}</span>
                  <span className={styles.problemChevron} aria-hidden="true">
                    <ChevronRight />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <div className={styles.callSection}>
          <a href="tel:3246" className={styles.callBtn}>
            <PhoneIcon />
            {t('aide.callCustomerService')}
          </a>
        </div>
      </div>
    </AppLayout>
  )
}
