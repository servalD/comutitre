import { NavLink } from 'react-router-dom'
import { NAV_ITEMS, type TabId } from './nav-items'
import styles from './DesktopNav.module.css'

interface DesktopNavProps {
  activeTab?: TabId
}

export function DesktopNav({ activeTab }: DesktopNavProps) {
  return (
    <nav className={styles.nav} aria-label="Navigation principale">
      {NAV_ITEMS.map((item) => {
        if (item.disabled) {
          return (
            <span
              key={item.id}
              className={[styles.link, styles.disabled].join(' ')}
              aria-disabled="true"
            >
              {item.label}
            </span>
          )
        }

        return (
          <NavLink
            key={item.id}
            to={item.to}
            end={item.id === 'accueil'}
            className={({ isActive }) =>
              [styles.link, isActive || activeTab === item.id ? styles.active : '']
                .filter(Boolean)
                .join(' ')
            }
          >
            {item.label}
          </NavLink>
        )
      })}
    </nav>
  )
}
