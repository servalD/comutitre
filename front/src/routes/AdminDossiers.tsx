import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  justificatifsApi,
  type JustificatifResponse,
  STATUS_COLORS,
  STATUS_LABELS,
} from '../api/justificatifs';
import { useAuth } from '../contexts/AuthContext';
import styles from './AdminDossiers.module.css';

export default function AdminDossiers() {
  const { token, user } = useAuth();

  if (!user?.roles?.includes('ADMIN')) {
    return <Navigate to="/" replace />;
  }

  return <AdminDossiersContent token={token!} />;
}

function AdminDossiersContent({ token }: { token: string }) {
  const [items, setItems] = useState<JustificatifResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [motif, setMotif] = useState('');
  const [showMotifFor, setShowMotifFor] = useState<{
    id: string;
    action: 'validate' | 'refuse';
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    justificatifsApi
      .listPending(token)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void justificatifsApi
      .listPending(token)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDecision(
    id: string,
    action: 'validate' | 'refuse',
    motifValue: string,
  ) {
    setActionId(id);
    setError(null);
    try {
      if (action === 'validate') {
        await justificatifsApi.validate(token, id, motifValue || undefined);
      } else {
        await justificatifsApi.refuse(token, id, motifValue);
      }
      setItems((prev) => prev.filter((i) => i.id !== id));
      setShowMotifFor(null);
      setMotif('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Back-office — File justificatifs</h1>
        <button className={styles.btnRefresh} onClick={load}>Actualiser</button>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.hint}>Chargement…</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <p>Aucun justificatif en attente de validation.</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {items.map((j) => (
            <li key={j.id} className={styles.item}>
              <div className={styles.itemMeta}>
                <div className={styles.itemRow}>
                  <span className={styles.metaLabel}>Type</span>
                  <strong>{j.type}</strong>
                </div>
                <div className={styles.itemRow}>
                  <span className={styles.metaLabel}>Fichier</span>
                  <span>{j.originalFilename}</span>
                </div>
                <div className={styles.itemRow}>
                  <span className={styles.metaLabel}>Contrat</span>
                  <span className={styles.mono}>{j.contractId.slice(0, 8)}…</span>
                </div>
                <div className={styles.itemRow}>
                  <span className={styles.metaLabel}>Statut</span>
                  <span
                    className={styles.badge}
                    style={{ background: STATUS_COLORS[j.status] ?? '#1972D2' }}
                  >
                    {STATUS_LABELS[j.status] ?? j.status}
                  </span>
                </div>
                {j.yousignStatus && (
                  <div className={styles.itemRow}>
                    <span className={styles.metaLabel}>YouSign</span>
                    <span className={styles.ysStatus}>{j.yousignStatus}</span>
                    {j.yousignStatusCodes?.length > 0 && (
                      <span className={styles.ysCode}>
                        {j.yousignStatusCodes.join(', ')}
                      </span>
                    )}
                  </div>
                )}
                <div className={styles.itemRow}>
                  <span className={styles.metaLabel}>Reçu le</span>
                  <span>{new Date(j.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              {showMotifFor?.id === j.id ? (
                <div className={styles.motifBox}>
                  <textarea
                    className={styles.motifInput}
                    placeholder={
                      showMotifFor.action === 'refuse'
                        ? 'Motif du refus (obligatoire)…'
                        : 'Commentaire (optionnel)…'
                    }
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    rows={3}
                  />
                  <div className={styles.motifActions}>
                    <button
                      className={
                        showMotifFor.action === 'refuse'
                          ? styles.btnRefuse
                          : styles.btnValidate
                      }
                      disabled={
                        !!actionId ||
                        (showMotifFor.action === 'refuse' && !motif.trim())
                      }
                      onClick={() =>
                        handleDecision(j.id, showMotifFor.action, motif)
                      }
                    >
                      {actionId === j.id
                        ? 'En cours…'
                        : showMotifFor.action === 'refuse'
                          ? 'Confirmer le refus'
                          : 'Confirmer la validation'}
                    </button>
                    <button
                      className={styles.btnCancel}
                      onClick={() => {
                        setShowMotifFor(null);
                        setMotif('');
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.actions}>
                  <button
                    className={styles.btnValidate}
                    disabled={!!actionId}
                    onClick={() =>
                      setShowMotifFor({ id: j.id, action: 'validate' })
                    }
                  >
                    Valider
                  </button>
                  <button
                    className={styles.btnRefuse}
                    disabled={!!actionId}
                    onClick={() =>
                      setShowMotifFor({ id: j.id, action: 'refuse' })
                    }
                  >
                    Refuser
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
