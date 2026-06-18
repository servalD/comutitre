import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './MobileShell.module.css';

type TabId = 'home' | 'titres' | 'alertes' | 'compte' | 'admin';

interface MobileShellProps {
  title: string;
  subtitle?: string;
  step?: number;
  totalSteps?: number;
  activeTab?: TabId;
  tabHrefs?: Partial<Record<TabId, string>>;
  showNav?: boolean;
  children: React.ReactNode;
}

function TrainIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2c-4 3-8 3.5-8 9.5 0 3.5 2 6.5 4 8v3h8v-3c2-1.5 4-4.5 4-8C20 5.5 16 5 12 2zm0 2.2c2.8.8 5.2 1.5 5.8 5.3H6.2c.6-3.8 3-4.5 5.8-5.3zM8 18v-1.2c.9.4 1.9.7 3 .9 1.1-.2 2.1-.5 3-.9V18H8z" />
    </svg>
  );
}

function NavIcon({ name }: { name: TabId }) {
  const paths: Record<TabId, React.ReactNode> = {
    home: (
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    ),
    titres: (
      <>
        <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
    alertes: (
      <>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    compte: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
      </>
    ),
    admin: (
      <>
        <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none" />
        <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none" />
        <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none" />
        <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export default function MobileShell({
  title,
  subtitle,
  step,
  totalSteps = 4,
  activeTab = 'home',
  tabHrefs,
  showNav = true,
  children,
}: MobileShellProps) {
  const location = useLocation();
  const { user } = useAuth();

  const tabs = [
    { id: 'home' as const, label: 'Accueil', to: '/abonnements' },
    { id: 'titres' as const, label: 'Titres', to: '/justificatifs' },
    ...(user?.roles?.includes('ADMIN')
      ? [{ id: 'admin' as const, label: 'Admin', to: '/admin/dossiers' }]
      : []),
    { id: 'compte' as const, label: 'Compte', to: '/abonnements' },
  ];

  const isActive = (tab: (typeof tabs)[number]) =>
    tab.id === activeTab ||
    (tab.id !== 'compte' && location.pathname === (tabHrefs?.[tab.id] ?? tab.to));

  return (
    <div className={styles.shell}>
      <div className={styles.frame}>
        <header className={styles.topbar}>
          <div className={styles.topbarRow}>
            <div className={styles.topbarContent}>
              <div className={styles.topbarLogo}>
                <div className={styles.logoMark}>
                  <TrainIcon />
                </div>
                <div className={styles.logoText}>
                  comu<span>titres</span>
                </div>
              </div>
              <h1 className={styles.topbarTitle}>{title}</h1>
              {subtitle && <p className={styles.topbarSub}>{subtitle}</p>}
            </div>
            {showNav && (
            <nav className={styles.desktopNav} aria-label="Navigation principale">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  to={tabHrefs?.[tab.id] ?? tab.to}
                  className={`${styles.desktopNavLink} ${isActive(tab) ? styles.desktopNavLinkActive : ''}`}
                >
                  {tab.label}
                </Link>
              ))}
            </nav>
            )}
          </div>
        </header>

        {step !== undefined && (
          <div className={styles.progressWrap}>
            <div className={styles.progressSteps} role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={totalSteps}>
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`${styles.progressStep} ${
                    i + 1 < step
                      ? styles.progressStepDone
                      : i + 1 === step
                        ? styles.progressStepActive
                        : ''
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <main className={styles.main}>{children}</main>

        {showNav && (
        <nav className={styles.navTabs} aria-label="Navigation mobile">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              to={tabHrefs?.[tab.id] ?? tab.to}
              className={`${styles.navTab} ${tab.id === activeTab ? styles.navTabActive : ''}`}
            >
              <NavIcon name={tab.id} />
              {tab.label}
            </Link>
          ))}
        </nav>
        )}
      </div>
    </div>
  );
}
