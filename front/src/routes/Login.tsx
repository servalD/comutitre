import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import styles from './Auth.module.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { accessToken } = await authApi.login({ email, password });
      await login(accessToken);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  async function handleFranceConnect() {
    setError(null);
    setLoading(true);
    try {
      const { accessToken } = await authApi.loginWithFranceConnect();
      await login(accessToken);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
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
          <p className={styles.brandTagline}>Gérez vos titres de transport</p>
        </div>

        <h2 className={styles.title}>Connexion</h2>

        {error && (
          <div className={styles.alert} role="alert">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                fill="currentColor"
              />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className={styles.input}
              placeholder="vous@exemple.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label htmlFor="password" className={styles.label}>
                Mot de passe
              </label>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.spinner} aria-hidden="true" />
            ) : null}
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <div className={styles.divider}>
          <span>ou</span>
        </div>

        <button
          type="button"
          className={styles.btnFranceConnect}
          onClick={handleFranceConnect}
          disabled={loading}
        >
          <img
            src="/franceconnect-logo.svg"
            alt=""
            className={styles.fcLogo}
            aria-hidden="true"
          />
          S'identifier avec FranceConnect
        </button>

        <p className={styles.footer}>
          Pas encore de compte ?{' '}
          <Link to="/register" className={styles.link}>
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
