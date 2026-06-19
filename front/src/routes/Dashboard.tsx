import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import styles from './Dashboard.module.css';

const RENEWAL_DATE = new Date('2026-09-01').getTime();
const NOW = new Date('2026-06-17').getTime();
const DAYS_TO_RENEWAL = Math.ceil((RENEWAL_DATE - NOW) / 86_400_000);

const MOCK_CONTRACT = {
  id: 'CTR-2024-084521',
  produit: 'Navigo Annuel',
  zones: '1 – 5',
  dateDebut: '01/09/2025',
  dateRenouvellement: '01/09/2026',
  prochainPrelevement: { date: '28/06/2026', montant: '86,40 €' },
  support: { ref: '****  4521' },
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { t } = useTranslation('dashboard');

  const activity = [
    { id: 1, icon: '✔', label: t('activity.renewalScheduled'), date: '15 juin 2026', type: 'success' },
    { id: 2, icon: '💳', label: t('activity.paymentDone'), date: '28 mai 2026', type: 'info' },
    { id: 3, icon: '📧', label: t('activity.emailSent'), date: '01 mai 2026', type: 'info' },
    { id: 4, icon: '✔', label: t('activity.subscriptionActivated'), date: '01 sept. 2025', type: 'success' },
  ];

  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const days = DAYS_TO_RENEWAL;

  return (
    <div className={styles.layout}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <div className={styles.sidebarLogo}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className={styles.sidebarBrandName}>{t('common:brand.name')}</span>
        </div>

        <nav className={styles.sidebarNav}>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              [styles.navItem, isActive ? styles.navItemActive : ''].filter(Boolean).join(' ')
            }
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {t('common:nav.dashboard')}
          </NavLink>
          <NavLink
            to="/mobility"
            className={({ isActive }) =>
              [styles.navItem, isActive ? styles.navItemActive : ''].filter(Boolean).join(' ')
            }
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {t('common:nav.mobility')}
          </NavLink>
          <a className={styles.navItem} href="#">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {t('nav.subscription')}
          </a>
          <a className={styles.navItem} href="#">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="16" r="1" fill="currentColor"/>
            </svg>
            {t('nav.sav')}
          </a>
          <a className={styles.navItem} href="#">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20 12V22H4V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 7H2v5h20V7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {t('nav.documents')}
          </a>
          <a className={styles.navItem} href="#">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {t('nav.account')}
          </a>
        </nav>

        <div className={styles.sidebarUser}>
          <div className={styles.avatarSmall}>{initials}</div>
          <div className={styles.sidebarUserInfo}>
            <span className={styles.sidebarUserName}>{user?.displayName ?? t('user')}</span>
            <span className={styles.sidebarUserEmail}>{user?.email ?? ''}</span>
          </div>
          <button className={styles.logoutBtn} onClick={logout} title={t('logoutTitle')}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <h1 className={styles.pageTitle}>
              {t('greeting', { name: user?.displayName?.split(' ')[0] ?? t('you') })} 👋
            </h1>
            <p className={styles.pageSubtitle}>{t('subtitle')}</p>
          </div>
          <div className={styles.topbarActions}>
            <LanguageSwitcher />
            <button className={styles.btnAction}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t('notifications')}
              <span className={styles.badge}>1</span>
            </button>
          </div>
        </header>

        {/* Alertes */}
        <div className={`${styles.alert} ${styles.alert_warning}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
          {t('alertRenewal', { count: days })}
        </div>

        {/* KPI row */}
        <div className={styles.kpiRow}>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>{t('kpi.status')}</span>
            <span className={`${styles.kpiValue} ${styles.kpiGreen}`}>
              <span className={styles.dot} /> {t('active')}
            </span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>{t('kpi.nextPayment')}</span>
            <span className={styles.kpiValue}>{MOCK_CONTRACT.prochainPrelevement.montant}</span>
            <span className={styles.kpiSub}>{t('kpi.paymentOn', { date: MOCK_CONTRACT.prochainPrelevement.date })}</span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>{t('kpi.renewalIn')}</span>
            <span className={styles.kpiValue}>{t('kpi.days', { count: days })}</span>
            <span className={styles.kpiSub}>{MOCK_CONTRACT.dateRenouvellement}</span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>{t('kpi.physicalSupport')}</span>
            <span className={`${styles.kpiValue} ${styles.kpiGreen}`}>
              <span className={styles.dot} /> {t('valid')}
            </span>
            <span className={styles.kpiSub}>{MOCK_CONTRACT.support.ref}</span>
          </div>
        </div>

        {/* Content row */}
        <div className={styles.contentRow}>
          {/* Carte abonnement */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('nav.subscription')}</h2>
            <div className={styles.navigoCard}>
              <div className={styles.navigoCardHeader}>
                <div>
                  <div className={styles.navigoCardProduct}>{MOCK_CONTRACT.produit}</div>
                  <div className={styles.navigoCardZones}>{t('zones', { zones: MOCK_CONTRACT.zones })}</div>
                </div>
                <span className={styles.statusBadge}>{t('active')}</span>
              </div>
              <div className={styles.navigoCardChip} aria-hidden="true" />
              <div className={styles.navigoCardRef}>{MOCK_CONTRACT.support.ref}</div>
              <div className={styles.navigoCardFooter}>
                <div>
                  <div className={styles.navigoCardFooterLabel}>{t('card.start')}</div>
                  <div className={styles.navigoCardFooterValue}>{MOCK_CONTRACT.dateDebut}</div>
                </div>
                <div>
                  <div className={styles.navigoCardFooterLabel}>{t('card.renewal')}</div>
                  <div className={styles.navigoCardFooterValue}>{MOCK_CONTRACT.dateRenouvellement}</div>
                </div>
                <div>
                  <div className={styles.navigoCardFooterLabel}>{t('card.contractNo')}</div>
                  <div className={styles.navigoCardFooterValue}>{MOCK_CONTRACT.id}</div>
                </div>
              </div>
            </div>

            <div className={styles.quickActions}>
              <button className={styles.quickActionBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <polyline points="23 4 23 10 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t('actions.renew')}
              </button>
              <button className={styles.quickActionBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t('actions.contactSav')}
              </button>
              <button className={styles.quickActionBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {t('actions.lostStolen')}
              </button>
            </div>
          </div>

          {/* Activité récente */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('recentActivity')}</h2>
            <ul className={styles.activityList}>
              {activity.map((item) => (
                <li key={item.id} className={styles.activityItem}>
                  <span className={`${styles.activityIcon} ${styles[`activityIcon_${item.type}`]}`}>
                    {item.icon}
                  </span>
                  <div className={styles.activityBody}>
                    <span className={styles.activityLabel}>{item.label}</span>
                    <span className={styles.activityDate}>{item.date}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles.infoBox}>
              <div className={styles.infoBoxTitle}>{t('holderInfo')}</div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoKey}>{t('info.name')}</span>
                  <span className={styles.infoVal}>{user?.displayName ?? '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoKey}>{t('info.email')}</span>
                  <span className={styles.infoVal}>{user?.email ?? '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoKey}>{t('info.account')}</span>
                  <span className={styles.infoVal}>
                    {user?.provider === 'franceconnect' ? 'FranceConnect' : t('info.local')}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoKey}>{t('info.role')}</span>
                  <span className={styles.infoVal}>{user?.roles?.[0] ?? 'user'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
