import { type ReactNode, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BottomNav } from './BottomNav'
import { DesktopNav } from './DesktopNav'
import { Logo } from './Logo'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'
import { useAuth } from '../../contexts/AuthContext'
import type { TabId } from './nav-items'
import styles from './AppLayout.module.css'

interface AppLayoutProps {
  children: ReactNode
  activeTab?: TabId
  showProfile?: boolean
}

function ProfileMenu() {
  const { t } = useTranslation('common')
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} className={styles.profileWrap}>
      <button
        type="button"
        className={styles.profileBtn}
        aria-label={t('myProfile')}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className={styles.dropdown}>
          {user?.displayName && (
            <div className={styles.dropdownUser}>
              <span className={styles.dropdownName}>{user.displayName}</span>
              {user.email && <span className={styles.dropdownEmail}>{user.email}</span>}
            </div>
          )}
          <button
            type="button"
            className={styles.dropdownLogout}
            onClick={() => { setOpen(false); logout() }}
          >
            {t('actions.logout')}
          </button>
        </div>
      )}
    </div>
  )
}

export function AppLayout({
  children,
  activeTab = 'accueil',
  showProfile = true,
}: AppLayoutProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Logo />
          <DesktopNav activeTab={activeTab} />
          <LanguageSwitcher />
          {showProfile && <ProfileMenu />}
        </div>
      </header>

      <main className={styles.main}>{children}</main>
      <BottomNav activeTab={activeTab} />
    </div>
  )
}
