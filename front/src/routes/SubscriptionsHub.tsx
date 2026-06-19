import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MobileShell from '../components/MobileShell';
import { contractsApi, type ContractResponse } from '../api/contracts';
import { useAuth } from '../contexts/AuthContext';
import ui from '../styles/comutitres-ui.module.css';

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

function statusPillClass(status: string): string {
  if (status === 'actif') return ui.pillOk;
  if (status.startsWith('en_attente') || status === 'signature_en_cours') return ui.pillPending;
  if (status === 'suspendu' || status === 'resilie') return ui.pillFail;
  return ui.pillNeutral;
}

/** Hub contrats YouSign : création, justificatifs et signature CGVU. */
export default function SubscriptionsHub() {
  const { user, logout, token } = useAuth();
  const { t } = useTranslation('subscription');
  const statusLabels = t('hub.statuses', { returnObjects: true }) as Record<string, string>;
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

  const firstContractId = contracts[0]?.id;
  const tabHrefs = firstContractId
    ? { titres: `/justificatifs?contractId=${firstContractId}` as const }
    : undefined;

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
      setCreateError(err instanceof Error ? err.message : t('hub.error'));
    } finally {
      setCreating(false);
    }
  }

  const firstName = user?.displayName?.split(' ')[0] ?? t('hub.you');
  const pendingCount = contracts.filter((c) => c.status.startsWith('en_attente')).length;
  const activeCount = contracts.filter((c) => c.status === 'actif').length;

  return (
    <MobileShell
      title={t('hub.greeting', { name: firstName })}
      subtitle={t('hub.subtitle')}
      activeTab="home"
      tabHrefs={tabHrefs}
    >
      <div className={ui.screenBody}>
        {contracts.some((c) => c.status === 'en_attente_de_justificatif') && (
          <div className={ui.warningCard}>
            <span aria-hidden="true">⚠</span>
            <p>{t('hub.warnDocuments')}</p>
          </div>
        )}
        {contracts.some((c) => c.status === 'en_attente_de_signature_payeur') && (
          <div className={ui.warningCard}>
            <span aria-hidden="true">✍</span>
            <p>{t('hub.warnSignature')}</p>
          </div>
        )}

        <div className={ui.kpiGrid}>
          <div className={ui.kpiCard}>
            <span className={ui.kpiValue} style={{ color: 'var(--green)' }}>{activeCount}</span>
            <span className={ui.kpiLabel}>{t('hub.activeContracts')}</span>
          </div>
          <div className={ui.kpiCard}>
            <span className={ui.kpiValue} style={{ color: 'var(--orange)' }}>{pendingCount}</span>
            <span className={ui.kpiLabel}>{t('hub.pending')}</span>
          </div>
          <div className={ui.kpiCard}>
            <span className={ui.kpiValue}>{contracts.length}</span>
            <span className={ui.kpiLabel}>{t('hub.totalContracts')}</span>
          </div>
          <div className={ui.kpiCard}>
            <span className={ui.kpiValue} style={{ fontSize: '14px' }}>{user?.email?.split('@')[0] ?? '—'}</span>
            <span className={ui.kpiLabel}>{t('hub.account')}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <p className={ui.sectionLabel} style={{ margin: 0 }}>{t('hub.myContracts')}</p>
          <button
            type="button"
            className={ui.btnSecondary}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '11px' }}
            onClick={() => setShowNewContract((v) => !v)}
          >
            {t('hub.new')}
          </button>
        </div>

        {showNewContract && (
          <form onSubmit={handleCreateContract} className={ui.profileCard}>
            <p className={ui.profileCardTitle}>{t('hub.newContract')}</p>
            <div className={ui.field}>
              <label htmlFor="productCode" className={ui.fieldLabel}>{t('hub.productType')}</label>
              <select
                id="productCode"
                className={ui.select}
                value={form.productCode}
                onChange={(e) => setForm((f) => ({ ...f, productCode: e.target.value }))}
              >
                {Object.entries(PRODUCT_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div className={ui.fieldRow}>
              <div className={ui.field}>
                <label htmlFor="holderFirstName" className={ui.fieldLabel}>{t('hub.holderFirstName')}</label>
                <input id="holderFirstName" required className={ui.input} value={form.holderFirstName} onChange={(e) => setForm((f) => ({ ...f, holderFirstName: e.target.value }))} />
              </div>
              <div className={ui.field}>
                <label htmlFor="holderLastName" className={ui.fieldLabel}>{t('hub.holderLastName')}</label>
                <input id="holderLastName" required className={ui.input} value={form.holderLastName} onChange={(e) => setForm((f) => ({ ...f, holderLastName: e.target.value }))} />
              </div>
            </div>
            <div className={ui.field}>
              <label htmlFor="holderEmail" className={ui.fieldLabel}>{t('hub.holderEmail')}</label>
              <input id="holderEmail" required type="email" className={ui.input} value={form.holderEmail || user?.email || ''} onChange={(e) => setForm((f) => ({ ...f, holderEmail: e.target.value }))} />
            </div>
            {createError && <div className={ui.errorCard}>{createError}</div>}
            <button type="submit" className={ui.btnPrimary} disabled={creating}>
              {creating ? t('hub.creating') : t('hub.createSubmit')}
            </button>
          </form>
        )}

        {contracts.length === 0 ? (
          <div className={ui.profileCard}>
            <p className={ui.hint}>{t('hub.empty')}</p>
          </div>
        ) : (
          contracts.map((c) => (
            <div key={c.id} className={ui.forfaitItem}>
              <div className={ui.forfaitTop}>
                <span className={ui.forfaitName}>{PRODUCT_LABELS[c.productCode] ?? c.productCode}</span>
                <span className={`${ui.statusPill} ${statusPillClass(c.status)}`}>
                  {statusLabels[c.status] ?? c.status}
                </span>
              </div>
              <p className={ui.forfaitDesc}>
                {t('hub.ref', { id: c.id.slice(0, 8), email: c.holderEmail })}
              </p>
              <div className={ui.forfaitActions}>
                <Link to={`/contrat/${c.id}`} className={ui.btnActionPrimary}>{t('hub.viewFile')}</Link>
                <Link to={`/justificatifs?contractId=${c.id}`} className={ui.btnActionSecondary}>{t('hub.documents')}</Link>
              </div>
            </div>
          ))
        )}

        <button type="button" className={ui.humanLink} onClick={logout}>
          {t('hub.logout')}
        </button>
      </div>
    </MobileShell>
  );
}
