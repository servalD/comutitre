import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MobileShell from '../components/MobileShell';
import { contractsApi, type ContractResponse } from '../api/contracts';
import { justificatifsApi, type JustificatifResponse, STATUS_LABELS } from '../api/justificatifs';
import { useAuth } from '../contexts/AuthContext';
import ui from '../styles/comutitres-ui.module.css';

const STATUS_LABELS_CONTRACT: Record<string, string> = {
  brouillon: 'Brouillon',
  en_attente_de_justificatif: 'En attente de justificatifs',
  en_attente_de_validation_documentaire: 'En attente de validation',
  en_attente_de_signature_payeur: 'Prêt à signer',
  signature_en_cours: 'Signature en cours',
  actif: 'Actif',
  suspendu: 'Suspendu',
  resilie: 'Résilié',
};

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
  const { token } = useAuth();

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
    try {
      const { signatureLink } = await contractsApi.startSignature(token, id);
      if (signatureLink) {
        window.location.href = signatureLink;
      } else {
        setSignError('Lien de signature non disponible. Réessayez dans quelques instants.');
        setSigning(false);
      }
    } catch (err) {
      setSignError(err instanceof Error ? err.message : 'Erreur lors du lancement de la signature');
      setSigning(false);
    }
  }

  if (loading) {
    return (
      <MobileShell title="Dossier" subtitle="Chargement…" activeTab="titres">
        <div className={ui.screenBody} style={{ textAlign: 'center', paddingTop: 32 }}>
          <span className={ui.spinnerDark} style={{ width: 32, height: 32, margin: '0 auto', display: 'block' }} />
        </div>
      </MobileShell>
    );
  }

  if (!contract) {
    return (
      <MobileShell title="Dossier" subtitle="Introuvable" activeTab="titres">
        <div className={ui.screenBody}>
          <p className={ui.hint}>Contrat introuvable.</p>
          <Link to="/" className={ui.humanLink}>← Retour à l'accueil</Link>
        </div>
      </MobileShell>
    );
  }

  const isActive = contract.status === 'actif';
  const canSign =
    contract.status === 'en_attente_de_signature_payeur' ||
    contract.status === 'en_attente_de_justificatif';

  return (
    <MobileShell
      title="Dossier de souscription"
      subtitle={`Réf. ${contract.id.slice(0, 8)}…`}
      activeTab="titres"
      tabHrefs={{ titres: `/justificatifs?contractId=${contract.id}` }}
    >
      <div className={ui.screenBody}>
        <div className={ui.forfaitTop} style={{ marginBottom: 12 }}>
          <span className={ui.forfaitName}>{contract.productCode}</span>
          <span className={`${ui.statusPill} ${statusPillClass(contract.status)}`}>
            {STATUS_LABELS_CONTRACT[contract.status] ?? contract.status}
          </span>
        </div>

        <p className={ui.sectionLabel}>Informations contrat</p>
        <div className={ui.summaryCard}>
          <div className={ui.summaryRow}>
            <span className={ui.summaryKey}>Porteur</span>
            <span className={ui.summaryVal}>{contract.holderEmail}</span>
          </div>
          {contract.payerEmail && (
            <div className={ui.summaryRow}>
              <span className={ui.summaryKey}>Payeur</span>
              <span className={ui.summaryVal}>{contract.payerEmail}</span>
            </div>
          )}
          <div className={ui.summaryRow}>
            <span className={ui.summaryKey}>CGVU</span>
            <span className={ui.summaryVal}>v{contract.cgvuVersion}</span>
          </div>
        </div>

        <div className={ui.cardHeader}>
          <p className={ui.sectionLabel} style={{ margin: 0 }}>Justificatifs</p>
          <Link
            to={`/justificatifs?contractId=${contract.id}`}
            className={ui.btnSecondary}
            style={{ width: 'auto', padding: '6px 10px', fontSize: '10px' }}
          >
            Gérer
          </Link>
        </div>

        {justificatifs.length === 0 ? (
          <p className={ui.hint}>Aucun justificatif déposé.</p>
        ) : (
          <ul className={ui.docList}>
            {justificatifs.map((j) => (
              <li key={j.id} className={ui.docItem}>
                <span className={ui.docName}>{j.originalFilename}</span>
                <span className={`${ui.statusPill} ${docPillClass(j.status)}`}>
                  {STATUS_LABELS[j.status] ?? j.status}
                </span>
              </li>
            ))}
          </ul>
        )}

        <p className={ui.sectionLabel} style={{ marginTop: 16 }}>CGVU</p>
        <div className={ui.profileCard}>
          <p className={ui.hint} style={{ lineHeight: 1.6 }}>
            En signant, vous acceptez les CGVU du produit <strong>{contract.productCode}</strong>{' '}
            (version {contract.cgvuVersion}). Signature via YouSign avec audit de traçabilité.
          </p>
        </div>

        {isActive ? (
          <div className={ui.successCard}>✓ CGVU signées — contrat actif</div>
        ) : canSign ? (
          <>
            {signError && <div className={ui.errorCard}>{signError}</div>}
            <button type="button" className={ui.btnPrimary} onClick={handleSign} disabled={signing}>
              {signing ? 'Redirection vers YouSign…' : 'Signer les CGVU avec YouSign'}
            </button>
          </>
        ) : (
          <p className={ui.hint}>
            La signature sera disponible une fois tous les justificatifs validés.
          </p>
        )}

        <Link to="/" className={ui.humanLink}>← Retour à l'accueil</Link>
      </div>
    </MobileShell>
  );
}
