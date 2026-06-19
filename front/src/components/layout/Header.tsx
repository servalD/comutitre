import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'
import styles from './Header.module.css'

export function Header() {
  const { token, logout } = useAuth()
  const { t } = useTranslation('common')

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/mobility" className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            🚇
          </span>
          <span>
            <strong>{t('brand.name')}</strong>
            <small>{t('brand.tagline')}</small>
          </span>
        </Link>

        <div className={styles.actions}>
          {token ? (
            <>
              <nav className={styles.nav} aria-label={t('nav.ariaLabel')}>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    [styles.navLink, isActive ? styles.navLinkActive : ''].filter(Boolean).join(' ')
                  }
                >
                  {t('nav.dashboard')}
                </NavLink>
                <NavLink
                  to="/mobility"
                  className={({ isActive }) =>
                    [styles.navLink, isActive ? styles.navLinkActive : ''].filter(Boolean).join(' ')
                  }
                >
                  {t('nav.mobility')}
                </NavLink>
              </nav>
              <Button variant="ghost" onClick={logout}>
                {t('actions.logout')}
              </Button>
            </>
          ) : null}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
