import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MobileShell from '../components/MobileShell';
import { contractsApi } from '../api/contracts';
import { useAuth } from '../contexts/AuthContext';
import ui from '../styles/comutitres-ui.module.css';

export default function SignatureCallback() {
  const { t } = useTranslation('subscription');
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
    <MobileShell title={t('signatureCallback.title')} subtitle="YouSign" showNav={false}>
      <div className={ui.screenBody}>
        {!polled ? (
          <div style={{ textAlign: 'center', paddingTop: 32 }}>
            <span className={ui.spinnerDark} style={{ width: 32, height: 32, margin: '0 auto 16px', display: 'block' }} />
            <p className={ui.hint}>{t('signatureCallback.checking')}</p>
          </div>
        ) : isSuccess ? (
          <div className={ui.successScreen}>
            <div className={ui.successIcon}>✓</div>
            <h1 className={ui.successTitle}>{t('signatureCallback.successTitle')}</h1>
            <p className={ui.successText}>
              {t('signatureCallback.successText')}
              {contractStatus === 'done'
                ? ` ${t('signatureCallback.contractActive')}`
                : ` ${t('signatureCallback.contractSoon')}`}
            </p>
            <Link to={`/contrat/${contractId}`} className={ui.btnPrimary}>
              {t('signatureCallback.viewFile')}
            </Link>
          </div>
        ) : (
          <div className={ui.successScreen}>
            <div className={ui.successIcon} style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>✕</div>
            <h1 className={ui.successTitle}>{t('signatureCallback.cancelledTitle')}</h1>
            <p className={ui.successText}>{t('signatureCallback.cancelledText')}</p>
            <Link to={`/contrat/${contractId}`} className={ui.btnPrimary}>
              {t('signatureCallback.backToFile')}
            </Link>
          </div>
        )}
        <Link to="/" className={ui.humanLink}>← {t('common:nav.dashboard')}</Link>
      </div>
    </MobileShell>
  );
}
