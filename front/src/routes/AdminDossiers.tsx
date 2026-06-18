import { type FormEvent, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  justificatifsApi,
  STATUS_LABELS,
  type JustificatifResponse,
} from '../api/justificatifs';
import { mobilityApi } from '../api/mobility-api';
import MobileShell from '../components/MobileShell';
import { useAuth } from '../contexts/AuthContext';
import {
  foundSupportDecisionLabels,
  foundSupportFinalStatusLabels,
  foundSupportNotificationLabels,
  supportStatusLabels,
} from '../constants/labels';
import type {
  FoundSupportCase,
  FoundSupportClosure,
  FoundSupportDecision,
  FoundSupportFinalStatus,
  FoundSupportRiskFlag,
} from '../domain/types/mobility';
import ui from '../styles/comutitres-ui.module.css';

const riskFlagOptions: Array<{ value: FoundSupportRiskFlag; label: string }> = [
  { value: 'unpaid', label: 'Impaye' },
  { value: 'fraud', label: 'Fraude' },
  { value: 'litigation', label: 'Litige' },
];

function docPillClass(status: string): string {
  if (status === 'accepte' || status === 'pre_qualifie') return ui.pillOk;
  if (status === 'en_cours_de_verification' || status === 'recu') {
    return ui.pillPending;
  }
  if (status === 'a_revoir' || status === 'refuse') return ui.pillFail;
  return ui.pillNeutral;
}

function foundDecisionPillClass(decision: FoundSupportDecision): string {
  if (
    decision === 'FOUND_PICKUP_ALLOWED' ||
    decision === 'CONTROLLED_REUSE_ELIGIBLE'
  ) {
    return ui.pillOk;
  }
  if (decision === 'BACKOFFICE_REVIEW_REQUIRED') return ui.pillPending;
  if (
    decision === 'SUPPORT_ALREADY_REPLACED' ||
    decision === 'SUPPORT_UNUSABLE'
  ) {
    return ui.pillFail;
  }
  return ui.pillNeutral;
}

function compactId(value: string | null): string {
  if (!value) return 'Non disponible';
  return value.length > 12 ? `${value.slice(0, 8)}...` : value;
}

function formatDate(value: string | null): string {
  if (!value) return 'Non applicable';
  return new Date(value).toLocaleDateString('fr-FR');
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Erreur inattendue';
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

  const [supportId, setSupportId] = useState('');
  const [agencyId, setAgencyId] = useState('agence-defense');
  const [riskFlags, setRiskFlags] = useState<FoundSupportRiskFlag[]>([]);
  const [foundCase, setFoundCase] = useState<FoundSupportCase | null>(null);
  const [foundClosure, setFoundClosure] =
    useState<FoundSupportClosure | null>(null);
  const [foundLoading, setFoundLoading] = useState(false);
  const [foundClosingStatus, setFoundClosingStatus] =
    useState<FoundSupportFinalStatus | null>(null);
  const [identityCheckPerformed, setIdentityCheckPerformed] = useState(false);
  const [withdrawalProofReference, setWithdrawalProofReference] = useState('');
  const [foundError, setFoundError] = useState<string | null>(null);

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

  function toggleRiskFlag(flag: FoundSupportRiskFlag) {
    setRiskFlags((prev) =>
      prev.includes(flag)
        ? prev.filter((item) => item !== flag)
        : [...prev, flag],
    );
  }

  async function handleDeclareFoundSupport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextSupportId = supportId.trim();
    const nextAgencyId = agencyId.trim();

    if (!nextSupportId || !nextAgencyId) {
      setFoundError('Numero support et agence sont obligatoires.');
      return;
    }

    setFoundLoading(true);
    setFoundError(null);
    setFoundClosure(null);
    try {
      const result = await mobilityApi.declareFoundSupport({
        supportId: nextSupportId,
        agencyId: nextAgencyId,
        riskFlags: riskFlags.length > 0 ? riskFlags : undefined,
      });
      setFoundCase(result);
      setIdentityCheckPerformed(false);
      setWithdrawalProofReference('');
    } catch (err) {
      setFoundError(getErrorMessage(err));
    } finally {
      setFoundLoading(false);
    }
  }

  async function handleCloseFoundCase(finalStatus: FoundSupportFinalStatus) {
    if (!foundCase?.id) return;

    setFoundClosingStatus(finalStatus);
    setFoundError(null);
    try {
      const result = await mobilityApi.closeFoundSupportCase(foundCase.id, {
        finalStatus,
        identityCheckPerformed:
          finalStatus === 'withdrawn' ? identityCheckPerformed : undefined,
        withdrawalProofReference:
          finalStatus === 'withdrawn'
            ? withdrawalProofReference.trim()
            : undefined,
      });
      setFoundClosure(result);
      setFoundCase((prev) =>
        prev
          ? {
              ...prev,
              finalStatus: result.finalStatus,
              closedAt: result.closedAt,
              closedByAgentId: result.closedByAgentId,
            }
          : prev,
      );
    } catch (err) {
      setFoundError(getErrorMessage(err));
    } finally {
      setFoundClosingStatus(null);
    }
  }

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
      setError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  }

  return (
    <MobileShell
      title="Back-office"
      subtitle="SAV et justificatifs"
      activeTab="admin"
    >
      <div className={ui.screenBody}>
        <div className={ui.profileCard}>
          <p className={ui.sectionLabel}>Objet trouve billettique</p>
          <div className={ui.profileCardTitle}>
            Declarer un pass retrouve en agence
          </div>

          <form onSubmit={handleDeclareFoundSupport}>
            <div className={ui.fieldRow}>
              <label className={ui.field}>
                <span className={ui.fieldLabel}>Numero support</span>
                <input
                  className={ui.input}
                  value={supportId}
                  onChange={(event) => setSupportId(event.target.value)}
                  placeholder="UUID ou numero mock"
                />
              </label>
              <label className={ui.field}>
                <span className={ui.fieldLabel}>Agence de depot</span>
                <input
                  className={ui.input}
                  value={agencyId}
                  onChange={(event) => setAgencyId(event.target.value)}
                />
              </label>
            </div>

            <div className={ui.field}>
              <span className={ui.fieldLabel}>Signaux sensibles</span>
              <div className={ui.checkPillRow}>
                {riskFlagOptions.map((option) => (
                  <label key={option.value} className={ui.checkPill}>
                    <input
                      type="checkbox"
                      checked={riskFlags.includes(option.value)}
                      onChange={() => toggleRiskFlag(option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className={ui.btnPrimary}
              disabled={foundLoading}
            >
              {foundLoading ? 'Analyse en cours...' : 'Declarer le support'}
            </button>
          </form>
        </div>

        {foundError && <div className={ui.errorCard}>{foundError}</div>}

        {foundCase && (
          <div className={ui.forfaitItem}>
            <div className={ui.forfaitTop}>
              <span className={ui.forfaitName}>
                Support {compactId(foundCase.supportId)}
              </span>
              <span
                className={`${ui.statusPill} ${foundDecisionPillClass(
                  foundCase.decision,
                )}`}
              >
                {foundSupportDecisionLabels[foundCase.decision]}
              </span>
            </div>

            <div className={ui.summaryRow}>
              <span className={ui.summaryKey}>Porteur masque</span>
              <span className={ui.summaryVal}>
                {foundCase.holderMaskedName ?? 'Non disponible'}
              </span>
            </div>
            <div className={ui.summaryRow}>
              <span className={ui.summaryKey}>Statut support</span>
              <span className={ui.summaryVal}>
                {foundCase.supportStatus
                  ? supportStatusLabels[foundCase.supportStatus]
                  : 'Inconnu'}
              </span>
            </div>
            <div className={ui.summaryRow}>
              <span className={ui.summaryKey}>Notification</span>
              <span className={ui.summaryVal}>
                {foundSupportNotificationLabels[foundCase.notificationStrategy]}
              </span>
            </div>
            <div className={ui.summaryRow}>
              <span className={ui.summaryKey}>Date limite</span>
              <span className={ui.summaryVal}>
                {formatDate(foundCase.pickupDeadline)}
              </span>
            </div>

            {foundCase.userMessage.length > 0 && (
              <div className={ui.warningCard}>
                <div>
                  {foundCase.userMessage.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            )}

            {foundCase.id ? (
              <>
                <label className={ui.checkLine}>
                  <input
                    type="checkbox"
                    checked={identityCheckPerformed}
                    onChange={(event) =>
                      setIdentityCheckPerformed(event.target.checked)
                    }
                  />
                  Controle identite effectue
                </label>
                <input
                  className={ui.input}
                  value={withdrawalProofReference}
                  onChange={(event) =>
                    setWithdrawalProofReference(event.target.value)
                  }
                  placeholder="Reference preuve de retrait"
                />
                <div className={ui.actionRow}>
                  <button
                    type="button"
                    className={ui.btnValidate}
                    disabled={
                      foundClosingStatus !== null ||
                      !identityCheckPerformed ||
                      !withdrawalProofReference.trim()
                    }
                    onClick={() => handleCloseFoundCase('withdrawn')}
                  >
                    {foundClosingStatus === 'withdrawn'
                      ? 'Cloture...'
                      : 'Retrait controle'}
                  </button>
                  <button
                    type="button"
                    className={ui.btnCancel}
                    disabled={foundClosingStatus !== null}
                    onClick={() => handleCloseFoundCase('not_claimed')}
                  >
                    Non reclame
                  </button>
                  <button
                    type="button"
                    className={ui.btnCancel}
                    disabled={foundClosingStatus !== null}
                    onClick={() => handleCloseFoundCase('sent_to_backoffice')}
                  >
                    Back-office
                  </button>
                </div>
              </>
            ) : (
              <p className={ui.hint}>
                Support non reconnu : aucune donnee personnelle affichee.
              </p>
            )}
          </div>
        )}

        {foundClosure && (
          <div className={ui.successCard}>
            Cloture : {foundSupportFinalStatusLabels[foundClosure.finalStatus]}
          </div>
        )}

        <div
          style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}
        >
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
          <p className={ui.hint}>Chargement...</p>
        ) : items.length === 0 ? (
          <div className={ui.profileCard}>
            <p className={ui.hint}>
              Aucun justificatif en attente de validation.
            </p>
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
              <div
                className={ui.summaryRow}
                style={{ border: 'none', padding: '4px 0' }}
              >
                <span className={ui.summaryKey}>Contrat</span>
                <span className={ui.mono}>{j.contractId.slice(0, 8)}...</span>
              </div>
              {j.yousignStatus && (
                <div
                  className={ui.summaryRow}
                  style={{ border: 'none', padding: '4px 0' }}
                >
                  <span className={ui.summaryKey}>YouSign</span>
                  <span className={ui.summaryVal}>
                    {j.yousignStatus}
                    {j.yousignStatusCodes?.length > 0 &&
                      ` (${j.yousignStatusCodes.join(', ')})`}
                  </span>
                </div>
              )}
              <div
                className={ui.summaryRow}
                style={{ border: 'none', padding: '4px 0' }}
              >
                <span className={ui.summaryKey}>Recu le</span>
                <span className={ui.summaryVal}>
                  {new Date(j.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>

              {showMotifFor?.id === j.id ? (
                <div style={{ marginTop: 10 }}>
                  <textarea
                    className={ui.textarea}
                    placeholder={
                      showMotifFor.action === 'refuse'
                        ? 'Motif du refus (obligatoire)...'
                        : 'Commentaire (optionnel)...'
                    }
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    rows={3}
                  />
                  <div className={ui.actionRow}>
                    <button
                      type="button"
                      className={
                        showMotifFor.action === 'refuse'
                          ? ui.btnRefuse
                          : ui.btnValidate
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
                        ? 'En cours...'
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
                    onClick={() =>
                      setShowMotifFor({ id: j.id, action: 'validate' })
                    }
                  >
                    Valider
                  </button>
                  <button
                    type="button"
                    className={ui.btnRefuse}
                    disabled={!!actionId}
                    onClick={() =>
                      setShowMotifFor({ id: j.id, action: 'refuse' })
                    }
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
