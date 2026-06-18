import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { contractsApi } from '../api/contracts';
import { useAuth } from '../contexts/AuthContext';
import styles from './SignatureCallback.module.css';

export default function SignatureCallback() {
  const [searchParams] = useSearchParams();
  const contractId = searchParams.get('contractId') ?? '';
  const status = searchParams.get('status') as 'success' | 'error' | null;
  const { token } = useAuth();

  const [contractStatus, setContractStatus] = useState<string | null>(null);
  const [polled, setPolled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!token || !contractId || status !== 'success') {
        if (!cancelled) setPolled(true);
        return;
      }

      // Small delay to let the webhook process
      await new Promise((r) => setTimeout(r, 1500));
      if (cancelled) return;

      try {
        const result = await contractsApi.getSignatureStatus(token, contractId);
        if (!cancelled) setContractStatus(result.yousignStatus);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setPolled(true);
      }
    };

    void run();
    return () => { cancelled = true; };
  }, [token, contractId, status]);

  const isSuccess = status === 'success';

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {!polled ? (
          <div className={styles.loading}>Vérification de la signature…</div>
        ) : isSuccess ? (
          <>
            <div className={styles.iconSuccess}>✓</div>
            <h1 className={styles.title}>Signature reçue</h1>
            <p className={styles.text}>
              Votre signature a bien été transmise à YouSign.
              {contractStatus === 'done'
                ? ' Votre contrat est maintenant actif.'
                : ' Votre contrat sera activé sous quelques instants.'}
            </p>
            <Link to={`/contrat/${contractId}`} className={styles.btnPrimary}>
              Voir le dossier
            </Link>
          </>
        ) : (
          <>
            <div className={styles.iconError}>✕</div>
            <h1 className={styles.title}>Signature annulée</h1>
            <p className={styles.text}>
              La procédure de signature a été annulée ou une erreur s'est produite.
              Vous pouvez réessayer depuis votre dossier.
            </p>
            <Link to={`/contrat/${contractId}`} className={styles.btnPrimary}>
              Retour au dossier
            </Link>
          </>
        )}
        <Link to="/" className={styles.btnBack}>← Tableau de bord</Link>
      </div>
    </div>
  );
}
