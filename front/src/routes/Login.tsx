import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MobileShell from '../components/MobileShell';
import { authApi } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import {
  consumePostAuthRedirect,
  homeForZone,
  registerForZone,
  rememberPostAuthRedirect,
  type AuthZone,
} from '../auth/auth-zones';
import ui from '../styles/comutitres-ui.module.css';
import styles from './Auth.module.css';

interface LoginProps {
  zone?: AuthZone;
}

function resolveAfterAuth(zone: AuthZone, from: string | undefined): string {
  if (from && from.startsWith('/')) {
    return from;
  }
  return homeForZone(zone);
}

export default function Login({ zone = 'mobility' }: LoginProps) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function afterLogin(accessToken: string) {
    await login(accessToken);
    const target = consumePostAuthRedirect(resolveAfterAuth(zone, from));
    navigate(target, { replace: true });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { accessToken } = await authApi.login({ email, password });
      await afterLogin(accessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  async function handleFranceConnect() {
    setError(null);
    rememberPostAuthRedirect(resolveAfterAuth(zone, from));
    setLoading(true);
    try {
      if (import.meta.env.VITE_MOCK_AUTH === 'true') {
        const { accessToken } = await authApi.loginWithFranceConnect();
        await afterLogin(accessToken);
        return;
      }
      window.location.href = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/auth/franceconnect/login`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      setLoading(false);
    }
  }

  if (zone === 'titres') {
    return (
      <MobileShell title="Bienvenue" subtitle="Gérez vos titres de transport" showNav={false}>
        <div className={ui.screenBody}>
          <p className={ui.sectionLabel}>Comment souhaitez-vous continuer ?</p>

          <button
            type="button"
            className={ui.btnFranceConnect}
            onClick={handleFranceConnect}
            disabled={loading}
          >
            Se connecter avec FranceConnect
          </button>

          <div className={ui.divider}>
            <div className={ui.dividerLine} />
            <span className={ui.dividerText}>ou</span>
            <div className={ui.dividerLine} />
          </div>

          {error && <div className={ui.errorCard} role="alert">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className={ui.field}>
              <label htmlFor="email" className={ui.fieldLabel}>Adresse e-mail</label>
              <input id="email" type="email" autoComplete="email" required className={ui.input} placeholder="vous@exemple.fr" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className={ui.field}>
              <label htmlFor="password" className={ui.fieldLabel}>Mot de passe</label>
              <input id="password" type="password" autoComplete="current-password" required className={ui.input} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className={ui.btnPrimary} disabled={loading}>
              {loading && <span className={ui.spinner} aria-hidden="true" />}
              {loading ? 'Connexion…' : 'Se connecter →'}
            </button>
          </form>

          <Link to={registerForZone('titres')} className={ui.humanLink}>
            Pas encore de compte ? Créer un compte
          </Link>
        </div>
      </MobileShell>
    );
  }

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
          <p className={styles.brandTagline}>Espace mobilité</p>
        </div>

        <h2 className={styles.title}>Connexion</h2>

        {error && (
          <div className={styles.alert} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Adresse e-mail</label>
            <input id="email" type="email" autoComplete="email" required className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Mot de passe</label>
            <input id="password" type="password" autoComplete="current-password" required className={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <div className={styles.divider}><span>ou</span></div>

        <button type="button" className={styles.btnFranceConnect} onClick={handleFranceConnect} disabled={loading}>
          S&apos;identifier avec FranceConnect
        </button>

        <p className={styles.footer}>
          Pas encore de compte ?{' '}
          <Link to={registerForZone('mobility')} className={styles.link}>Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
