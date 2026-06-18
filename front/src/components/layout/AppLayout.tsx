import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { DesktopNav } from './DesktopNav'
import { Logo } from './Logo'
import type { TabId } from './nav-items'
import styles from './AppLayout.module.css'

interface AppLayoutProps {
  children: ReactNode
  activeTab?: TabId
  showProfile?: boolean
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
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

          {showProfile && (
            <button type="button" className={styles.profileBtn} aria-label="Mon profil">
              <ProfileIcon />
            </button>
          )}
        </div>
      </header>

      <main className={styles.main}>{children}</main>
      <BottomNav activeTab={activeTab} />
    </div>
  )
}
