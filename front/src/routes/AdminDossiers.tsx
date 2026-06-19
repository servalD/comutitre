import { type FormEvent, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  justificatifsApi,
  docStatusLabel,
  type JustificatifResponse,
} from '../api/justificatifs';
import { mobilityApi } from '../api/mobility-api';
import MobileShell from '../components/MobileShell';
import { useAuth } from '../contexts/AuthContext';
import i18n from '../i18n';
import { labelFor, useLabels } from '../constants/labels';
import type {
  AnomalyCase,
  FoundSupportCase,
  FoundSupportClosure,
  FoundSupportDecision,
  FoundSupportFinalStatus,
  FoundSupportRiskFlag,
} from '../domain/types/mobility';
import ui from '../styles/comutitres-ui.module.css';
import styles from './AdminDossiers.module.css';

const riskFlagValues: FoundSupportRiskFlag[] = ['unpaid', 'fraud', 'litigation'];
const agentSections = [
  { id: 'admin-indicators', key: 'indicators' },
  { id: 'admin-anomalies', key: 'anomalies' },
  { id: 'admin-found-supports', key: 'foundSupports' },
  { id: 'admin-dossiers', key: 'dossiers' },
] as const;

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

function anomalyPillClass(status: AnomalyCase['status']): string {
  if (status === 'closed') return ui.pillOk;
  if (status === 'in_review') return ui.pillPending;
  return ui.pillFail;
}

const ta = (key: string): string => i18n.t(key, { ns: 'subscription' });

function compactId(value: string | null): string {
  if (!value) return ta('admin.notAvailable');
  return value.length > 12 ? `${value.slice(0, 8)}...` : value;
}

function formatDate(value: string | null): string {
  if (!value) return ta('admin.notApplicable');
  return new Date(value).toLocaleDateString(i18n.language);
}

function formatCount(value: number, singular: string, plural: string): string {
  return `${value} ${value === 1 ? singular : plural}`;
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : ta('admin.unexpectedError');
}

export default function AdminDossiers() {
  const { token, user } = useAuth();

  if (!user?.roles?.includes('ADMIN')) {
    return <Navigate to="/" replace />;
  }

  return <AdminDossiersContent token={token!} />;
}

function AdminDossiersContent({ token }: { token: string }) {
  const { t } = useTranslation('subscription');
  const { supportStatusLabels } = useLabels();
  const riskFlagOptions = riskFlagValues.map((value) => ({
    value,
    label: t(`admin.riskFlags.${value}`),
  }));
  const [items, setItems] = useState<JustificatifResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [motif, setMotif] = useState('');
  const [showMotifFor, setShowMotifFor] = useState<{
    id: string;
    action: 'validate' | 'refuse';
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyCase[]>([]);
  const [anomaliesLoading, setAnomaliesLoading] = useState(true);

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
    loadAnomalies();
  };

  const loadAnomalies = () => {
    setAnomaliesLoading(true);
    mobilityApi
      .listOpenAnomalies()
      .then(setAnomalies)
      .catch(() => setAnomalies([]))
      .finally(() => setAnomaliesLoading(false));
  };

  useEffect(() => {
    void justificatifsApi
      .listPending(token)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
    void mobilityApi
      .listOpenAnomalies()
      .then(setAnomalies)
      .catch(() => setAnomalies([]))
      .finally(() => setAnomaliesLoading(false));
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
      setFoundError(t('admin.supportAgencyRequired'));
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

  const supportCaseOpen =
    foundCase && foundCase.closedAt === null && foundCase.id ? 1 : 0;
  const isSyncing =
    loading ||
    anomaliesLoading ||
    foundLoading ||
    foundClosingStatus !== null ||
    actionId !== null;

  return (
    <MobileShell
      title={t('admin.title')}
      subtitle={t('admin.subtitle')}
      activeTab="admin"
      showNav={false}
    >
      <div className={ui.screenBody}>
        <section className={styles.agentOverview} aria-labelledby="agent-title">
          <div className={styles.agentHeader}>
            <p className={ui.sectionLabel}>{t('admin.agent.label')}</p>
            <h2 id="agent-title" className={styles.agentTitle}>
              {t('admin.agent.title')}
            </h2>
            <p className={styles.agentSubtitle}>
              {t('admin.agent.subtitle')}
            </p>
          </div>

          <nav className={styles.agentNav} aria-label={t('admin.agent.nav')}>
            {agentSections.map((section) => (
              <a
                key={section.id}
                className={styles.agentNavLink}
                href={`#${section.id}`}
              >
                {t(`admin.agent.sections.${section.key}`)}
              </a>
            ))}
          </nav>

          <div id="admin-indicators" className={styles.kpiGrid}>
            <div className={styles.kpiTile}>
              <span className={styles.kpiValue}>{items.length}</span>
              <span className={styles.kpiLabel}>
                {formatCount(
                  items.length,
                  t('admin.count.dossier'),
                  t('admin.count.dossiers'),
                )}{' '}
                {t('admin.agent.toProcess')}
              </span>
            </div>
            <div className={styles.kpiTile}>
              <span className={styles.kpiValue}>{anomalies.length}</span>
              <span className={styles.kpiLabel}>
                {formatCount(
                  anomalies.length,
                  t('admin.count.anomaly'),
                  t('admin.count.anomalies'),
                )}{' '}
                {anomalies.length === 1
                  ? t('admin.agent.openSingular')
                  : t('admin.agent.openPlural')}
              </span>
            </div>
            <div className={styles.kpiTile}>
              <span className={styles.kpiValue}>{supportCaseOpen}</span>
              <span className={styles.kpiLabel}>
                {t('admin.agent.foundSupportOpen')}
              </span>
            </div>
            <div className={styles.kpiTile}>
              <span className={styles.kpiValue}>
                {isSyncing ? t('admin.agent.syncing') : t('admin.agent.ok')}
              </span>
              <span className={styles.kpiLabel}>
                {t('admin.agent.processingState')}
              </span>
            </div>
          </div>
        </section>

        <div id="admin-anomalies" className={ui.profileCard}>
          <p className={ui.sectionLabel}>{t('admin.anomalies.section')}</p>
          <div className={ui.profileCardTitle}>
            {t('admin.anomalies.title')}
          </div>
          {anomaliesLoading ? (
            <p className={ui.hint}>{t('admin.anomalies.loading')}</p>
          ) : anomalies.length === 0 ? (
            <p className={ui.hint}>{t('admin.anomalies.empty')}</p>
          ) : (
            anomalies.map((anomaly) => (
              <div key={anomaly.id} className={ui.forfaitItem}>
                <div className={ui.forfaitTop}>
                  <span className={ui.forfaitName}>{anomaly.summary}</span>
                  <span
                    className={`${ui.statusPill} ${anomalyPillClass(
                      anomaly.status,
                    )}`}
                  >
                    {t(`admin.anomalyStatuses.${anomaly.status}`)}
                  </span>
                </div>
                <div className={ui.summaryRow}>
                  <span className={ui.summaryKey}>
                    {t('admin.anomalies.right')}
                  </span>
                  <span className={ui.mono}>
                    {compactId(anomaly.transportRightId)}
                  </span>
                </div>
                <div className={ui.summaryRow}>
                  <span className={ui.summaryKey}>
                    {t('admin.anomalies.support')}
                  </span>
                  <span className={ui.mono}>{compactId(anomaly.supportId)}</span>
                </div>
                <div className={ui.summaryRow}>
                  <span className={ui.summaryKey}>
                    {t('admin.anomalies.openedOn')}
                  </span>
                  <span className={ui.summaryVal}>
                    {new Date(anomaly.createdAt).toLocaleString(i18n.language)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div id="admin-found-supports" className={ui.profileCard}>
          <p className={ui.sectionLabel}>{t('admin.lostObjectSection')}</p>
          <div className={ui.profileCardTitle}>
            {t('admin.declareFoundTitle')}
          </div>

          <form onSubmit={handleDeclareFoundSupport}>
            <div className={ui.fieldRow}>
              <label className={ui.field}>
                <span className={ui.fieldLabel}>{t('admin.supportNumber')}</span>
                <input
                  className={ui.input}
                  value={supportId}
                  onChange={(event) => setSupportId(event.target.value)}
                  placeholder={t('admin.supportPlaceholder')}
                />
              </label>
              <label className={ui.field}>
                <span className={ui.fieldLabel}>{t('admin.depotAgency')}</span>
                <input
                  className={ui.input}
                  value={agencyId}
                  onChange={(event) => setAgencyId(event.target.value)}
                />
              </label>
            </div>

            <div className={ui.field}>
              <span className={ui.fieldLabel}>{t('admin.riskSignals')}</span>
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
              {foundLoading ? t('admin.analyzing') : t('admin.declareSupport')}
            </button>
          </form>
        </div>

        {foundError && <div className={ui.errorCard}>{foundError}</div>}

        {foundCase && (
          <div className={ui.forfaitItem}>
            <div className={ui.forfaitTop}>
              <span className={ui.forfaitName}>
                {t('admin.supportWithId', { id: compactId(foundCase.supportId) })}
              </span>
              <span
                className={`${ui.statusPill} ${foundDecisionPillClass(
                  foundCase.decision,
                )}`}
              >
                {labelFor.foundSupportDecision(foundCase.decision)}
              </span>
            </div>

            <div className={ui.summaryRow}>
              <span className={ui.summaryKey}>{t('admin.maskedHolder')}</span>
              <span className={ui.summaryVal}>
                {foundCase.holderMaskedName ?? t('admin.notAvailable')}
              </span>
            </div>
            <div className={ui.summaryRow}>
              <span className={ui.summaryKey}>{t('admin.supportStatusLabel')}</span>
              <span className={ui.summaryVal}>
                {foundCase.supportStatus
                  ? supportStatusLabels[foundCase.supportStatus]
                  : t('admin.unknown')}
              </span>
            </div>
            <div className={ui.summaryRow}>
              <span className={ui.summaryKey}>{t('admin.notification')}</span>
              <span className={ui.summaryVal}>
                {labelFor.foundSupportNotification(foundCase.notificationStrategy)}
              </span>
            </div>
            <div className={ui.summaryRow}>
              <span className={ui.summaryKey}>{t('admin.deadline')}</span>
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
                  {t('admin.identityChecked')}
                </label>
                <input
                  className={ui.input}
                  value={withdrawalProofReference}
                  onChange={(event) =>
                    setWithdrawalProofReference(event.target.value)
                  }
                  placeholder={t('admin.withdrawalProofPlaceholder')}
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
                      ? t('admin.closing')
                      : t('admin.controlledWithdrawal')}
                  </button>
                  <button
                    type="button"
                    className={ui.btnCancel}
                    disabled={foundClosingStatus !== null}
                    onClick={() => handleCloseFoundCase('not_claimed')}
                  >
                    {t('admin.notClaimed')}
                  </button>
                  <button
                    type="button"
                    className={ui.btnCancel}
                    disabled={foundClosingStatus !== null}
                    onClick={() => handleCloseFoundCase('sent_to_backoffice')}
                  >
                    {t('admin.backOffice')}
                  </button>
                </div>
              </>
            ) : (
              <p className={ui.hint}>{t('admin.unrecognizedSupport')}</p>
            )}
          </div>
        )}

        {foundClosure && (
          <div className={ui.successCard}>
            {t('admin.closure', {
              status: labelFor.foundSupportFinalStatus(foundClosure.finalStatus),
            })}
          </div>
        )}

        <div id="admin-dossiers" className={styles.sectionToolbar}>
          <button
            type="button"
            className={`${ui.btnSecondary} ${styles.refreshButton}`}
            onClick={load}
          >
            {t('admin.refresh')}
          </button>
        </div>

        {error && <div className={ui.errorCard}>{error}</div>}

        {loading ? (
          <p className={ui.hint}>{t('common:loading')}</p>
        ) : items.length === 0 ? (
          <div className={ui.profileCard}>
            <p className={ui.hint}>{t('admin.noPending')}</p>
          </div>
        ) : (
          items.map((j) => (
            <div key={j.id} className={ui.forfaitItem}>
              <div className={ui.forfaitTop}>
                <span className={ui.forfaitName}>{j.type}</span>
                <span className={`${ui.statusPill} ${docPillClass(j.status)}`}>
                  {docStatusLabel(j.status)}
                </span>
              </div>
              <p className={ui.forfaitDesc}>{j.originalFilename}</p>
              <div
                className={ui.summaryRow}
                style={{ border: 'none', padding: '4px 0' }}
              >
                <span className={ui.summaryKey}>{t('admin.contract')}</span>
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
                <span className={ui.summaryKey}>{t('admin.receivedOn')}</span>
                <span className={ui.summaryVal}>
                  {new Date(j.createdAt).toLocaleDateString(i18n.language)}
                </span>
              </div>

              {showMotifFor?.id === j.id ? (
                <div style={{ marginTop: 10 }}>
                  <textarea
                    className={ui.textarea}
                    placeholder={
                      showMotifFor.action === 'refuse'
                        ? t('admin.refusalReason')
                        : t('admin.optionalComment')
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
                        ? t('admin.processing')
                        : showMotifFor.action === 'refuse'
                          ? t('admin.confirmRefusal')
                          : t('admin.confirmValidation')}
                    </button>
                    <button
                      type="button"
                      className={ui.btnCancel}
                      onClick={() => {
                        setShowMotifFor(null);
                        setMotif('');
                      }}
                    >
                      {t('common:actions.cancel')}
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
                    {t('admin.validate')}
                  </button>
                  <button
                    type="button"
                    className={ui.btnRefuse}
                    disabled={!!actionId}
                    onClick={() =>
                      setShowMotifFor({ id: j.id, action: 'refuse' })
                    }
                  >
                    {t('admin.refuse')}
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
