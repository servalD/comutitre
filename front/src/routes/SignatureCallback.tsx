import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import MobileShell from '../components/MobileShell';
import { contractsApi } from '../api/contracts';
import { useAuth } from '../contexts/AuthContext';
import ui from '../styles/comutitres-ui.module.css';

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
    <MobileShell title="Signature" subtitle="YouSign" showNav={false}>
      <div className={ui.screenBody}>
        {!polled ? (
          <div style={{ textAlign: 'center', paddingTop: 32 }}>
            <span className={ui.spinnerDark} style={{ width: 32, height: 32, margin: '0 auto 16px', display: 'block' }} />
            <p className={ui.hint}>Vérification de la signature…</p>
          </div>
        ) : isSuccess ? (
          <div className={ui.successScreen}>
            <div className={ui.successIcon}>✓</div>
            <h1 className={ui.successTitle}>Signature reçue</h1>
            <p className={ui.successText}>
              Votre signature a bien été transmise à YouSign.
              {contractStatus === 'done'
                ? ' Votre contrat est maintenant actif.'
                : ' Votre contrat sera activé sous quelques instants.'}
            </p>
            <Link to={`/contrat/${contractId}`} className={ui.btnPrimary}>
              Voir le dossier
            </Link>
          </div>
        ) : (
          <div className={ui.successScreen}>
            <div className={ui.successIcon} style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>✕</div>
            <h1 className={ui.successTitle}>Signature annulée</h1>
            <p className={ui.successText}>
              La procédure a été annulée ou une erreur s'est produite.
              Vous pouvez réessayer depuis votre dossier.
            </p>
            <Link to={`/contrat/${contractId}`} className={ui.btnPrimary}>
              Retour au dossier
            </Link>
          </div>
        )}
        <Link to="/" className={ui.humanLink}>← Tableau de bord</Link>
      </div>
    </MobileShell>
  );
}
