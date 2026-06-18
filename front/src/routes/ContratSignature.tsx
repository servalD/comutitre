import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { contractsApi, type ContractResponse } from '../api/contracts';
import { justificatifsApi, type JustificatifResponse, STATUS_LABELS, STATUS_COLORS } from '../api/justificatifs';
import { useAuth } from '../contexts/AuthContext';
import styles from './ContratSignature.module.css';

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
      <div className={styles.page}>
        <div className={styles.loading}>Chargement du contrat…</div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          Contrat introuvable. <Link to="/">← Retour</Link>
        </div>
      </div>
    );
  }

  const isActive = contract.status === 'actif';
  const canSign =
    contract.status === 'en_attente_de_signature_payeur' ||
    contract.status === 'en_attente_de_justificatif';

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>← Tableau de bord</Link>
        <h1 className={styles.title}>Dossier de souscription</h1>
        <span
          className={styles.statusBadge}
          style={{ background: isActive ? '#007D44' : '#1972D2' }}
        >
          {STATUS_LABELS_CONTRACT[contract.status] ?? contract.status}
        </span>
      </header>

      {/* Contract details */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Informations contrat</h2>
        <div className={styles.grid}>
          <div className={styles.row}><span>Produit</span><strong>{contract.productCode}</strong></div>
          <div className={styles.row}><span>Référence</span><strong>{contract.id.slice(0, 8)}…</strong></div>
          <div className={styles.row}><span>Email porteur</span><strong>{contract.holderEmail}</strong></div>
          {contract.payerEmail && (
            <div className={styles.row}><span>Email payeur</span><strong>{contract.payerEmail}</strong></div>
          )}
          <div className={styles.row}><span>Version CGVU</span><strong>{contract.cgvuVersion}</strong></div>
        </div>
      </section>

      {/* Justificatifs summary */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Justificatifs</h2>
          <Link
            to={`/justificatifs?contractId=${contract.id}`}
            className={styles.btnSecondary}
          >
            Gérer les justificatifs
          </Link>
        </div>
        {justificatifs.length === 0 ? (
          <p className={styles.hint}>Aucun justificatif déposé.</p>
        ) : (
          <ul className={styles.docList}>
            {justificatifs.map((j) => (
              <li key={j.id} className={styles.docItem}>
                <span className={styles.docName}>{j.originalFilename}</span>
                <span
                  className={styles.docBadge}
                  style={{ background: STATUS_COLORS[j.status] ?? '#1972D2' }}
                >
                  {STATUS_LABELS[j.status] ?? j.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* CGVU section */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Conditions Générales de Vente et d'Utilisation</h2>
        <div className={styles.cgvuBox}>
          <p className={styles.cgvuText}>
            En signant ce document, vous reconnaissez avoir pris connaissance et accepté
            les Conditions Générales de Vente et d'Utilisation du produit{' '}
            <strong>{contract.productCode}</strong> (version {contract.cgvuVersion}) émises
            par Île-de-France Mobilités, applicables à votre souscription.
          </p>
          <p className={styles.cgvuText}>
            La signature est réalisée via <strong>YouSign</strong>, prestataire de signature
            électronique qualifié. Un audit de traçabilité est généré et conservé pour chaque
            signature.
          </p>
        </div>

        {isActive ? (
          <div className={styles.successBox}>
            ✓ CGVU signées et contrat actif
          </div>
        ) : canSign ? (
          <>
            {signError && <p className={styles.error}>{signError}</p>}
            <button
              className={styles.btnSign}
              onClick={handleSign}
              disabled={signing}
            >
              {signing ? 'Redirection vers YouSign…' : 'Signer les CGVU avec YouSign'}
            </button>
          </>
        ) : (
          <p className={styles.hint}>
            La signature sera disponible une fois tous les justificatifs validés.
          </p>
        )}
      </section>
    </div>
  );
}
