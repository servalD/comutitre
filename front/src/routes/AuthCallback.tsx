import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './Auth.module.css';

/**
 * Landing page for the FranceConnect redirect.
 * The backend sends: /auth/callback#access_token=<jwt>
 * We extract the token, persist it, then redirect home.
 */
export default function AuthCallback() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const hash = window.location.hash;
    const params = new URLSearchParams(hash.slice(1));
    const token = params.get('access_token');

    if (!token) {
      navigate('/login?error=callback_failed', { replace: true });
      return;
    }

    login(token)
      .then(() => navigate('/', { replace: true }))
      .catch(() => navigate('/login?error=callback_failed', { replace: true }));
  }, [login, navigate]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h1 className={styles.brandName}>Comutitres</h1>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--idfm-blue)' }}>
          <span className={styles.spinner} style={{ display: 'inline-block', marginRight: '8px' }} aria-hidden="true" />
          Connexion en cours…
        </p>
      </div>
    </div>
  );
}
