import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { contractsApi, type ContractResponse } from '../api/contracts';
import { useAuth } from '../contexts/AuthContext';

import styles from './Dashboard.module.css';

const MOCK_ACTIVITE = [
  { id: 1, icon: '✔', label: 'Renouvellement automatique programmé', date: '15 juin 2026', type: 'success' },
  { id: 2, icon: '💳', label: 'Prélèvement de 86,40 € effectué', date: '28 mai 2026', type: 'info' },
  { id: 3, icon: '📧', label: 'E-mail de confirmation envoyé', date: '01 mai 2026', type: 'info' },
  { id: 4, icon: '✔', label: 'Abonnement activé', date: '01 sept. 2025', type: 'success' },
];

const PRODUCT_LABELS: Record<string, string> = {
  navigo_annuel: 'Navigo Annuel',
  navigo_annuel_senior: 'Navigo Senior',
  imagine_r_scolaire: 'Imagine R Scolaire',
  imagine_r_junior: 'Imagine R Junior',
  imagine_r_etudiant: 'Imagine R Étudiant',
  navigo_liberte_plus: 'Navigo Liberté+',
  tst: 'TST',
  amethyste: 'Améthyste',
};

const STATUS_COLORS: Record<string, string> = {
  actif: '#007D44',
  en_attente_de_justificatif: '#F39224',
  en_attente_de_validation_documentaire: '#F39224',
  en_attente_de_signature_payeur: '#1972D2',
  signature_en_cours: '#1972D2',
  brouillon: '#64B5F6',
  suspendu: '#C52625',
  resilie: '#C52625',
};

const STATUS_LABELS: Record<string, string> = {
  actif: 'Actif',
  en_attente_de_justificatif: 'En attente de justificatifs',
  en_attente_de_validation_documentaire: 'En attente de validation',
  en_attente_de_signature_payeur: 'À signer',
  signature_en_cours: 'Signature en cours',
  brouillon: 'Brouillon',
  suspendu: 'Suspendu',
  resilie: 'Résilié',
};

export default function Dashboard() {
  const { user, logout, token } = useAuth();
  const [contracts, setContracts] = useState<ContractResponse[]>([]);
  const [showNewContract, setShowNewContract] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [form, setForm] = useState({
    productCode: 'navigo_annuel',
    holderFirstName: '',
    holderLastName: '',
    holderEmail: '',
  });

  useEffect(() => {
    if (user?.email) setForm((f) => ({ ...f, holderEmail: f.holderEmail || user.email! }));
  }, [user?.email]);

  useEffect(() => {
    if (!token) return;
    contractsApi.list(token).then(setContracts).catch(() => {});
  }, [token]);

  async function handleCreateContract(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    setCreateError(null);
    try {
      const c = await contractsApi.create(token, {
        productCode: form.productCode,
        holderFirstName: form.holderFirstName,
        holderLastName: form.holderLastName,
        holderEmail: form.holderEmail || (user?.email ?? ''),
      });
      setContracts((prev) => [c, ...prev]);
      setShowNewContract(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setCreating(false);
    }
  }

  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

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
          <span className={styles.sidebarBrandName}>Comutitres</span>
        </div>

        <nav className={styles.sidebarNav}>
          <a className={`${styles.navItem} ${styles.navItemActive}`} href="#">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Tableau de bord
          </a>
          <a className={styles.navItem} href="#">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Mon abonnement
          </a>
          <a className={styles.navItem} href="#">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="16" r="1" fill="currentColor"/>
            </svg>
            Assistance SAV
          </a>
          <Link
            className={styles.navItem}
            to={contracts[0] ? `/justificatifs?contractId=${contracts[0].id}` : '/justificatifs'}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20 12V22H4V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 7H2v5h20V7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Justificatifs
          </Link>
          <a className={styles.navItem} href="#">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Mon compte
          </a>
          {user?.roles?.includes('ADMIN') && (
            <Link className={styles.navItem} to="/admin/dossiers">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Back-office
            </Link>
          )}
        </nav>

        <div className={styles.sidebarUser}>
          <div className={styles.avatarSmall}>{initials}</div>
          <div className={styles.sidebarUserInfo}>
            <span className={styles.sidebarUserName}>{user?.displayName ?? 'Utilisateur'}</span>
            <span className={styles.sidebarUserEmail}>{user?.email ?? ''}</span>
          </div>
          <button className={styles.logoutBtn} onClick={logout} title="Se déconnecter">
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
              Bonjour, {user?.displayName?.split(' ')[0] ?? 'vous'} 👋
            </h1>
            <p className={styles.pageSubtitle}>Voici un résumé de votre compte Comutitres</p>
          </div>
          <div className={styles.topbarActions}>
            <button className={styles.btnAction}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Notifications
              <span className={styles.badge}>1</span>
            </button>
          </div>
        </header>

        {/* Alertes dynamiques */}
        {contracts.some((c) => c.status === 'en_attente_de_justificatif') && (
          <div className={`${styles.alert} ${styles.alert_warning}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="16" r="1" fill="currentColor"/>
            </svg>
            Un ou plusieurs contrats nécessitent des justificatifs.
          </div>
        )}
        {contracts.some((c) => c.status === 'en_attente_de_signature_payeur') && (
          <div className={`${styles.alert} ${styles.alert_warning}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="16" r="1" fill="currentColor"/>
            </svg>
            Un ou plusieurs contrats sont en attente de signature.
          </div>
        )}

        {/* KPI row */}
        <div className={styles.kpiRow}>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Contrats actifs</span>
            <span className={`${styles.kpiValue} ${styles.kpiGreen}`}>
              <span className={styles.dot} /> {contracts.filter((c) => c.status === 'actif').length}
            </span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>En attente</span>
            <span className={styles.kpiValue} style={{ color: '#F39224' }}>
              {contracts.filter((c) => c.status.startsWith('en_attente')).length}
            </span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>À signer</span>
            <span className={styles.kpiValue} style={{ color: '#1972D2' }}>
              {contracts.filter((c) => c.status === 'en_attente_de_signature_payeur' || c.status === 'signature_en_cours').length}
            </span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Total contrats</span>
            <span className={styles.kpiValue}>{contracts.length}</span>
          </div>
        </div>

        {/* Content row */}
        <div className={styles.contentRow}>
          {/* Contrats réels */}
          <div className={styles.section}>
            <div className={styles.newContractHeader}>
              <h2 className={styles.sectionTitle}>Mes contrats</h2>
              <button
                type="button"
                className={styles.newContractToggle}
                onClick={() => setShowNewContract((v) => !v)}
              >
                + Nouveau contrat
              </button>
            </div>

            {showNewContract && (
              <form onSubmit={handleCreateContract} className={styles.newContractForm}>
                <div className={styles.newContractField}>
                  <label htmlFor="productCode" className={styles.newContractLabel}>
                    Type de forfait
                  </label>
                  <select
                    id="productCode"
                    className={styles.newContractSelect}
                    value={form.productCode}
                    onChange={(e) => setForm((f) => ({ ...f, productCode: e.target.value }))}
                  >
                    {Object.entries(PRODUCT_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.newContractRow}>
                  <div className={styles.newContractField}>
                    <label htmlFor="holderFirstName" className={styles.newContractLabel}>
                      Prénom du porteur
                    </label>
                    <input
                      id="holderFirstName"
                      required
                      className={styles.newContractInput}
                      placeholder="Prénom"
                      value={form.holderFirstName}
                      onChange={(e) => setForm((f) => ({ ...f, holderFirstName: e.target.value }))}
                    />
                  </div>
                  <div className={styles.newContractField}>
                    <label htmlFor="holderLastName" className={styles.newContractLabel}>
                      Nom du porteur
                    </label>
                    <input
                      id="holderLastName"
                      required
                      className={styles.newContractInput}
                      placeholder="Nom"
                      value={form.holderLastName}
                      onChange={(e) => setForm((f) => ({ ...f, holderLastName: e.target.value }))}
                    />
                  </div>
                </div>

                <div className={styles.newContractField}>
                  <label htmlFor="holderEmail" className={styles.newContractLabel}>
                    E-mail du porteur
                  </label>
                  <input
                    id="holderEmail"
                    required
                    type="email"
                    className={styles.newContractInput}
                    placeholder="email@exemple.fr"
                    value={form.holderEmail}
                    onChange={(e) => setForm((f) => ({ ...f, holderEmail: e.target.value }))}
                  />
                </div>

                {createError && (
                  <p className={styles.newContractError}>{createError}</p>
                )}

                <button
                  type="submit"
                  disabled={creating}
                  className={styles.newContractSubmit}
                >
                  {creating ? 'Création…' : 'Créer le contrat'}
                </button>
              </form>
            )}

            {contracts.length === 0 ? (
              <p style={{ color: '#64b5f6', fontSize: '0.9rem' }}>Aucun contrat. Cliquez sur « + Nouveau contrat » pour commencer.</p>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {contracts.map((c) => (
                  <li key={c.id} className={styles.navigoCard} style={{ padding: '1rem 1.25rem' }}>
                    <div className={styles.navigoCardHeader}>
                      <div>
                        <div className={styles.navigoCardProduct}>{PRODUCT_LABELS[c.productCode] ?? c.productCode}</div>
                        <div className={styles.navigoCardZones} style={{ fontSize: '0.8rem', marginTop: 2 }}>{c.id.slice(0, 8)}…</div>
                      </div>
                      <span
                        className={styles.statusBadge}
                        style={{ background: STATUS_COLORS[c.status] ?? '#1972D2' }}
                      >
                        {STATUS_LABELS[c.status] ?? c.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem', flexWrap: 'wrap' }}>
                      <Link
                        to={`/contrat/${c.id}`}
                        style={{ padding: '0.4rem 0.875rem', background: '#1972D2', color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600 }}
                      >
                        Voir le dossier
                      </Link>
                      <Link
                        to={`/justificatifs?contractId=${c.id}`}
                        style={{ padding: '0.4rem 0.875rem', background: '#deeeff', color: '#1972D2', borderRadius: 6, textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600 }}
                      >
                        Justificatifs
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Activité récente */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Activité récente</h2>
            <ul className={styles.activityList}>
              {MOCK_ACTIVITE.map((item) => (
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
              <div className={styles.infoBoxTitle}>Informations porteur</div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoKey}>Nom</span>
                  <span className={styles.infoVal}>{user?.displayName ?? '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoKey}>E-mail</span>
                  <span className={styles.infoVal}>{user?.email ?? '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoKey}>Compte</span>
                  <span className={styles.infoVal}>
                    {user?.provider === 'franceconnect' ? 'FranceConnect' : 'Local'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoKey}>Rôle</span>
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
