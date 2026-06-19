import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import MobileShell from '../components/MobileShell';
import { contractsApi, type ContractResponse } from '../api/contracts';
import { justificatifsApi, type JustificatifResponse, docStatusLabel } from '../api/justificatifs';
import { useAuth } from '../contexts/AuthContext';
import { allRequiredDocumentsReady, buildRequiredDocumentSlots } from '../domain/justificatif-slots';
import ui from '../styles/comutitres-ui.module.css';

function statusPillClass(status: string): string {
  if (status === 'actif') return ui.pillOk;
  if (status.startsWith('en_attente') || status === 'signature_en_cours') return ui.pillPending;
  if (status === 'suspendu' || status === 'resilie') return ui.pillFail;
  return ui.pillNeutral;
}

function docPillClass(status: string): string {
  if (status === 'accepte' || status === 'pre_qualifie') return ui.pillOk;
  if (status === 'en_cours_de_verification' || status === 'recu') return ui.pillPending;
  if (status === 'a_revoir' || status === 'refuse') return ui.pillFail;
  return ui.pillNeutral;
}

export default function ContratSignature() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { t } = useTranslation('subscription');
  const contractStatuses = t('contract.statuses', { returnObjects: true }) as Record<string, string>;

  const [contract, setContract] = useState<ContractResponse | null>(null);
  const [justificatifs, setJustificatifs] = useState<JustificatifResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !id) return;
    Promise.all([
      contractsApi.get(token, id),
      justificatifsApi.list(token, id),
    ])
      .then(([c, j]) => {
        setContract(c);
        setJustificatifs(j);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, id]);

  async function handleSign() {
    if (!token || !id) return;
    setSigning(true);
    setSignError(null);
    const win = window.open('', '_blank');
    try {
      const result = await contractsApi.startSignature(token, id);
      if (result.alreadySigned || result.contractStatus === 'actif') {
        win?.close();
        navigate(`/dossier/paiement?contractId=${id}`);
        return;
      }
      if (result.signatureLink) {
        if (win) {
          win.location.href = result.signatureLink;
        } else {
          window.location.href = result.signatureLink;
        }
      } else {
        win?.close();
        setSignError(t('contract.signLinkUnavailable'));
      }
    } catch (err) {
      win?.close();
      setSignError(err instanceof Error ? err.message : t('contract.signError'));
    } finally {
      setSigning(false);
    }
  }

  if (loading) {
    return (
      <MobileShell title={t('contract.fileTitle')} subtitle={t('common:loading')} activeTab="titres">
        <div className={ui.screenBody} style={{ textAlign: 'center', paddingTop: 32 }}>
          <span className={ui.spinnerDark} style={{ width: 32, height: 32, margin: '0 auto', display: 'block' }} />
        </div>
      </MobileShell>
    );
  }

  if (!contract) {
    return (
      <MobileShell title={t('contract.fileTitle')} subtitle={t('contract.notFoundSubtitle')} activeTab="titres">
        <div className={ui.screenBody}>
          <p className={ui.hint}>{t('contract.notFound')}</p>
          <Link to="/" className={ui.humanLink}>← {t('contract.backHome')}</Link>
        </div>
      </MobileShell>
    );
  }

  const isActive = contract.status === 'actif';
  const documentSlots = buildRequiredDocumentSlots(contract.productCode, justificatifs);
  const documentsReady = allRequiredDocumentsReady(documentSlots);
  const canSign =
    contract.status === 'en_attente_de_signature_payeur' && documentsReady;

  return (
    <MobileShell
      title={t('contract.title')}
      subtitle={t('contract.refSubtitle', { id: contract.id.slice(0, 8) })}
      activeTab="titres"
      tabHrefs={{ titres: `/justificatifs?contractId=${contract.id}` }}
    >
      <div className={ui.screenBody}>
        <div className={ui.forfaitTop} style={{ marginBottom: 12 }}>
          <span className={ui.forfaitName}>{contract.productCode}</span>
          <span className={`${ui.statusPill} ${statusPillClass(contract.status)}`}>
            {contractStatuses[contract.status] ?? contract.status}
          </span>
        </div>

        <p className={ui.sectionLabel}>{t('contract.infoTitle')}</p>
        <div className={ui.summaryCard}>
          <div className={ui.summaryRow}>
            <span className={ui.summaryKey}>{t('contract.holder')}</span>
            <span className={ui.summaryVal}>{contract.holderEmail}</span>
          </div>
          {contract.payerEmail && (
            <div className={ui.summaryRow}>
              <span className={ui.summaryKey}>{t('contract.payer')}</span>
              <span className={ui.summaryVal}>{contract.payerEmail}</span>
            </div>
          )}
          <div className={ui.summaryRow}>
            <span className={ui.summaryKey}>{t('contract.cgvu')}</span>
            <span className={ui.summaryVal}>v{contract.cgvuVersion}</span>
          </div>
        </div>

        <div className={ui.cardHeader}>
          <p className={ui.sectionLabel} style={{ margin: 0 }}>{t('contract.documents')}</p>
          <Link
            to={`/justificatifs?contractId=${contract.id}`}
            className={ui.btnSecondary}
            style={{ width: 'auto', padding: '6px 10px', fontSize: '10px' }}
          >
            {t('contract.manage')}
          </Link>
        </div>

        {justificatifs.length === 0 ? (
          <p className={ui.hint}>{t('contract.noDocuments')}</p>
        ) : (
          <ul className={ui.docList}>
            {justificatifs.map((j) => (
              <li key={j.id} className={ui.docItem}>
                <span className={ui.docName}>{j.originalFilename}</span>
                <span className={`${ui.statusPill} ${docPillClass(j.status)}`}>
                  {docStatusLabel(j.status)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <p className={ui.sectionLabel} style={{ marginTop: 16 }}>{t('contract.cgvu')}</p>
        <div className={ui.profileCard}>
          <p className={ui.hint} style={{ lineHeight: 1.6 }}>
            <Trans
              i18nKey="contract.cgvuText"
              ns="subscription"
              values={{ product: contract.productCode, version: contract.cgvuVersion }}
              components={{ strong: <strong /> }}
            />
          </p>
        </div>

        {isActive ? (
          <div className={ui.successCard}>{t('contract.signed')}</div>
        ) : canSign ? (
          <>
            {signError && <div className={ui.errorCard}>{signError}</div>}
            <button type="button" className={ui.btnPrimary} onClick={handleSign} disabled={signing}>
              {signing ? t('contract.redirecting') : t('contract.signCgvu')}
            </button>
          </>
        ) : (
          <p className={ui.hint}>{t('contract.signAfterDocs')}</p>
        )}

        <Link to="/" className={ui.humanLink}>← {t('contract.backHome')}</Link>
      </div>
    </MobileShell>
  );
}
