import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import styles from './Auth.module.css';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setLoading(true);
    try {
      const { accessToken } = await authApi.register({
        firstName,
        lastName,
        email,
        password,
      });
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

        <h2 className={styles.title}>Créer un compte</h2>

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
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="firstName" className={styles.label}>
                Prénom
              </label>
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                required
                className={styles.input}
                placeholder="Marie"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="lastName" className={styles.label}>
                Nom
              </label>
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                required
                className={styles.input}
                placeholder="Dupont"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

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
            <label htmlFor="password" className={styles.label}>
              Mot de passe{' '}
              <span className={styles.hint}>(8 caractères minimum)</span>
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="confirm" className={styles.label}>
              Confirmer le mot de passe
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              className={styles.input}
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
            {loading ? 'Création…' : 'Créer mon compte'}
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
          Déjà un compte ?{' '}
          <Link to="/login" className={styles.link}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
