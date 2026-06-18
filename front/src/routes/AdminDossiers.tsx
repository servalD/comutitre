import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import MobileShell from '../components/MobileShell';
import {
  justificatifsApi,
  type JustificatifResponse,
  STATUS_LABELS,
} from '../api/justificatifs';
import { useAuth } from '../contexts/AuthContext';
import ui from '../styles/comutitres-ui.module.css';

function docPillClass(status: string): string {
  if (status === 'accepte' || status === 'pre_qualifie') return ui.pillOk;
  if (status === 'en_cours_de_verification' || status === 'recu') return ui.pillPending;
  if (status === 'a_revoir' || status === 'refuse') return ui.pillFail;
  return ui.pillNeutral;
}

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
    setLoading(true);
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
  }, [token]);

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
    <MobileShell
      title="Back-office"
      subtitle="File justificatifs"
      activeTab="admin"
    >
      <div className={ui.screenBody}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button
            type="button"
            className={ui.btnSecondary}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '11px' }}
            onClick={load}
          >
            Actualiser
          </button>
        </div>

        {error && <div className={ui.errorCard}>{error}</div>}

        {loading ? (
          <p className={ui.hint}>Chargement…</p>
        ) : items.length === 0 ? (
          <div className={ui.profileCard}>
            <p className={ui.hint}>Aucun justificatif en attente de validation.</p>
          </div>
        ) : (
          items.map((j) => (
            <div key={j.id} className={ui.forfaitItem}>
              <div className={ui.forfaitTop}>
                <span className={ui.forfaitName}>{j.type}</span>
                <span className={`${ui.statusPill} ${docPillClass(j.status)}`}>
                  {STATUS_LABELS[j.status] ?? j.status}
                </span>
              </div>
              <p className={ui.forfaitDesc}>{j.originalFilename}</p>
              <div className={ui.summaryRow} style={{ border: 'none', padding: '4px 0' }}>
                <span className={ui.summaryKey}>Contrat</span>
                <span className={ui.mono}>{j.contractId.slice(0, 8)}…</span>
              </div>
              {j.yousignStatus && (
                <div className={ui.summaryRow} style={{ border: 'none', padding: '4px 0' }}>
                  <span className={ui.summaryKey}>YouSign</span>
                  <span className={ui.summaryVal}>
                    {j.yousignStatus}
                    {j.yousignStatusCodes?.length > 0 && ` (${j.yousignStatusCodes.join(', ')})`}
                  </span>
                </div>
              )}
              <div className={ui.summaryRow} style={{ border: 'none', padding: '4px 0' }}>
                <span className={ui.summaryKey}>Reçu le</span>
                <span className={ui.summaryVal}>{new Date(j.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>

              {showMotifFor?.id === j.id ? (
                <div style={{ marginTop: 10 }}>
                  <textarea
                    className={ui.textarea}
                    placeholder={
                      showMotifFor.action === 'refuse'
                        ? 'Motif du refus (obligatoire)…'
                        : 'Commentaire (optionnel)…'
                    }
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    rows={3}
                  />
                  <div className={ui.actionRow}>
                    <button
                      type="button"
                      className={showMotifFor.action === 'refuse' ? ui.btnRefuse : ui.btnValidate}
                      disabled={
                        !!actionId ||
                        (showMotifFor.action === 'refuse' && !motif.trim())
                      }
                      onClick={() => handleDecision(j.id, showMotifFor.action, motif)}
                    >
                      {actionId === j.id
                        ? 'En cours…'
                        : showMotifFor.action === 'refuse'
                          ? 'Confirmer le refus'
                          : 'Confirmer la validation'}
                    </button>
                    <button
                      type="button"
                      className={ui.btnCancel}
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
                <div className={ui.actionRow}>
                  <button
                    type="button"
                    className={ui.btnValidate}
                    disabled={!!actionId}
                    onClick={() => setShowMotifFor({ id: j.id, action: 'validate' })}
                  >
                    Valider
                  </button>
                  <button
                    type="button"
                    className={ui.btnRefuse}
                    disabled={!!actionId}
                    onClick={() => setShowMotifFor({ id: j.id, action: 'refuse' })}
                  >
                    Refuser
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </MobileShell>
  );
}
