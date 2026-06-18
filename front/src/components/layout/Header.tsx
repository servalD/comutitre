import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import styles from './Header.module.css'

export function Header() {
  const { token, logout } = useAuth()

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/mobility" className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            🚇
          </span>
          <span>
            <strong>Comutitres</strong>
            <small>Espace client</small>
          </span>
        </Link>

        {token ? (
          <div className={styles.actions}>
            <nav className={styles.nav} aria-label="Navigation principale">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  [styles.navLink, isActive ? styles.navLinkActive : ''].filter(Boolean).join(' ')
                }
              >
                Tableau de bord
              </NavLink>
              <NavLink
                to="/mobility"
                className={({ isActive }) =>
                  [styles.navLink, isActive ? styles.navLinkActive : ''].filter(Boolean).join(' ')
                }
              >
                Mobilité
              </NavLink>
            </nav>
            <Button variant="ghost" onClick={logout}>
              Déconnexion
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  )
}
