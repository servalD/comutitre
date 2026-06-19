import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { NAV_ITEMS, type TabId } from './nav-items'
import styles from './BottomNav.module.css'

interface BottomNavProps {
  activeTab?: TabId
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FoyerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AideIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path
        d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="currentColor" />
    </svg>
  )
}

const ICONS = {
  accueil: HomeIcon,
  foyer: FoyerIcon,
  aide: AideIcon,
} as const

const MOBILE_LABEL_KEYS: Record<TabId, string> = {
  accueil: 'tabs.accueil',
  foyer: 'tabs.foyerShort',
  aide: 'tabs.aide',
}

export function BottomNav({ activeTab }: BottomNavProps) {
  const { t } = useTranslation('common')
  return (
    <nav className={styles.nav} aria-label={t('nav.mobileAriaLabel')}>
      {NAV_ITEMS.map((item) => {
        const Icon = ICONS[item.id]
        const isActive = activeTab === item.id

        if (item.disabled) {
          return (
            <span
              key={item.id}
              className={[styles.tab, styles.disabled].join(' ')}
              aria-disabled="true"
            >
              <Icon />
              <span>{t(MOBILE_LABEL_KEYS[item.id])}</span>
            </span>
          )
        }

        return (
          <NavLink
            key={item.id}
            to={item.to}
            className={({ isActive: routeActive }) =>
              [styles.tab, routeActive || isActive ? styles.active : '']
                .filter(Boolean)
                .join(' ')
            }
            end={item.id === 'accueil'}
          >
            <Icon />
            <span>{t(MOBILE_LABEL_KEYS[item.id])}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
