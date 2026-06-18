import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

const STATUS_LABELS: Record<string, string> = {
  actif: 'Actif',
  en_attente_de_justificatif: 'Justificatifs requis',
  en_attente_de_validation_documentaire: 'En validation',
  en_attente_de_signature_payeur: 'À signer',
  signature_en_cours: 'Signature en cours',
  brouillon: 'Brouillon',
  suspendu: 'Suspendu',
  resilie: 'Résilié',
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
      setCreateError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setCreating(false);
    }
  }

  const firstName = user?.displayName?.split(' ')[0] ?? 'vous';
  const pendingCount = contracts.filter((c) => c.status.startsWith('en_attente')).length;
  const activeCount = contracts.filter((c) => c.status === 'actif').length;

  return (
    <MobileShell
      title={`Bonjour, ${firstName}`}
      subtitle="Mes contrats et justificatifs"
      activeTab="home"
      tabHrefs={tabHrefs}
    >
      <div className={ui.screenBody}>
        {contracts.some((c) => c.status === 'en_attente_de_justificatif') && (
          <div className={ui.warningCard}>
            <span aria-hidden="true">⚠</span>
            <p>Un ou plusieurs contrats nécessitent des justificatifs.</p>
          </div>
        )}
        {contracts.some((c) => c.status === 'en_attente_de_signature_payeur') && (
          <div className={ui.warningCard}>
            <span aria-hidden="true">✍</span>
            <p>Un ou plusieurs contrats sont en attente de signature.</p>
          </div>
        )}

        <div className={ui.kpiGrid}>
          <div className={ui.kpiCard}>
            <span className={ui.kpiValue} style={{ color: 'var(--green)' }}>{activeCount}</span>
            <span className={ui.kpiLabel}>Contrats actifs</span>
          </div>
          <div className={ui.kpiCard}>
            <span className={ui.kpiValue} style={{ color: 'var(--orange)' }}>{pendingCount}</span>
            <span className={ui.kpiLabel}>En attente</span>
          </div>
          <div className={ui.kpiCard}>
            <span className={ui.kpiValue}>{contracts.length}</span>
            <span className={ui.kpiLabel}>Total contrats</span>
          </div>
          <div className={ui.kpiCard}>
            <span className={ui.kpiValue} style={{ fontSize: '14px' }}>{user?.email?.split('@')[0] ?? '—'}</span>
            <span className={ui.kpiLabel}>Compte</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <p className={ui.sectionLabel} style={{ margin: 0 }}>Mes contrats</p>
          <button
            type="button"
            className={ui.btnSecondary}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '11px' }}
            onClick={() => setShowNewContract((v) => !v)}
          >
            + Nouveau
          </button>
        </div>

        {showNewContract && (
          <form onSubmit={handleCreateContract} className={ui.profileCard}>
            <p className={ui.profileCardTitle}>Nouveau contrat</p>
            <div className={ui.field}>
              <label htmlFor="productCode" className={ui.fieldLabel}>Type de forfait</label>
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
                <label htmlFor="holderFirstName" className={ui.fieldLabel}>Prénom porteur</label>
                <input id="holderFirstName" required className={ui.input} value={form.holderFirstName} onChange={(e) => setForm((f) => ({ ...f, holderFirstName: e.target.value }))} />
              </div>
              <div className={ui.field}>
                <label htmlFor="holderLastName" className={ui.fieldLabel}>Nom porteur</label>
                <input id="holderLastName" required className={ui.input} value={form.holderLastName} onChange={(e) => setForm((f) => ({ ...f, holderLastName: e.target.value }))} />
              </div>
            </div>
            <div className={ui.field}>
              <label htmlFor="holderEmail" className={ui.fieldLabel}>E-mail porteur</label>
              <input id="holderEmail" required type="email" className={ui.input} value={form.holderEmail || user?.email || ''} onChange={(e) => setForm((f) => ({ ...f, holderEmail: e.target.value }))} />
            </div>
            {createError && <div className={ui.errorCard}>{createError}</div>}
            <button type="submit" className={ui.btnPrimary} disabled={creating}>
              {creating ? 'Création…' : 'Créer le contrat'}
            </button>
          </form>
        )}

        {contracts.length === 0 ? (
          <div className={ui.profileCard}>
            <p className={ui.hint}>Aucun contrat. Cliquez sur « + Nouveau » pour commencer.</p>
          </div>
        ) : (
          contracts.map((c) => (
            <div key={c.id} className={ui.forfaitItem}>
              <div className={ui.forfaitTop}>
                <span className={ui.forfaitName}>{PRODUCT_LABELS[c.productCode] ?? c.productCode}</span>
                <span className={`${ui.statusPill} ${statusPillClass(c.status)}`}>
                  {STATUS_LABELS[c.status] ?? c.status}
                </span>
              </div>
              <p className={ui.forfaitDesc}>Réf. {c.id.slice(0, 8)}… · {c.holderEmail}</p>
              <div className={ui.forfaitActions}>
                <Link to={`/contrat/${c.id}`} className={ui.btnActionPrimary}>Voir le dossier</Link>
                <Link to={`/justificatifs?contractId=${c.id}`} className={ui.btnActionSecondary}>Justificatifs</Link>
              </div>
            </div>
          ))
        )}

        <button type="button" className={ui.humanLink} onClick={logout}>
          Se déconnecter
        </button>
      </div>
    </MobileShell>
  );
}
