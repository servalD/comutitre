import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MobileShell from '../components/MobileShell';
import { useAuth } from '../contexts/AuthContext';
import {
  consumePostAuthRedirect,
  homeForZone,
  loginForZone,
  type AuthZone,
} from '../auth/auth-zones';
import ui from '../styles/comutitres-ui.module.css';
import styles from './Auth.module.css';

interface AuthCallbackProps {
  zone?: AuthZone;
}

export default function AuthCallback({ zone = 'mobility' }: AuthCallbackProps) {
  const { login } = useAuth();
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const hash = window.location.hash;
    const params = new URLSearchParams(hash.slice(1));
    const token = params.get('access_token');
    const loginTo = loginForZone(zone);
    const home = homeForZone(zone);

    if (!token) {
      navigate(`${loginTo}?error=callback_failed`, { replace: true });
      return;
    }

    login(token)
      .then(() => navigate(consumePostAuthRedirect(home), { replace: true }))
      .catch(() => navigate(`${loginTo}?error=callback_failed`, { replace: true }));
  }, [login, navigate, zone]);

  if (zone === 'titres') {
    return (
      <MobileShell title={t('login.title')} subtitle="FranceConnect" showNav={false}>
        <div className={ui.screenBody} style={{ textAlign: 'center', paddingTop: 32 }}>
          <span className={ui.spinnerDark} style={{ width: 32, height: 32, margin: '0 auto 16px', display: 'block' }} />
          <p className={ui.hint}>{t('callback.connecting')}</p>
        </div>
      </MobileShell>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <p style={{ textAlign: 'center' }}>{t('callback.connecting')}</p>
      </div>
    </div>
  );
}
