import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MobileShell from '../components/MobileShell';
import { authApi } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import {
  consumePostAuthRedirect,
  homeForZone,
  loginForZone,
  type AuthZone,
} from '../auth/auth-zones';
import ui from '../styles/comutitres-ui.module.css';
import styles from './Auth.module.css';

interface RegisterProps {
  zone?: AuthZone;
}

function resolveAfterAuth(zone: AuthZone, from: string | undefined): string {
  if (from && from.startsWith('/')) {
    return from;
  }
  return homeForZone(zone);
}

export default function Register({ zone = 'mobility' }: RegisterProps) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
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
        birthDate,
        email,
        password,
      });
      await login(accessToken);
      const target = consumePostAuthRedirect(resolveAfterAuth(zone, from));
      navigate(target, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  if (zone === 'titres') {
    return (
      <MobileShell title="Créer un compte" subtitle="Rejoignez Comutitres" showNav={false}>
        <div className={ui.screenBody}>
          {error && <div className={ui.errorCard} role="alert">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className={ui.fieldRow}>
              <div className={ui.field}>
                <label htmlFor="firstName" className={ui.fieldLabel}>Prénom</label>
                <input id="firstName" required className={ui.input} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className={ui.field}>
                <label htmlFor="lastName" className={ui.fieldLabel}>Nom</label>
                <input id="lastName" required className={ui.input} value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className={ui.field}>
              <label htmlFor="birthDate" className={ui.fieldLabel}>Date de naissance</label>
              <input id="birthDate" type="date" required className={ui.input} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
            <div className={ui.field}>
              <label htmlFor="email" className={ui.fieldLabel}>E-mail</label>
              <input id="email" type="email" required className={ui.input} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className={ui.field}>
              <label htmlFor="password" className={ui.fieldLabel}>Mot de passe (8 car. min.)</label>
              <input id="password" type="password" required minLength={8} className={ui.input} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className={ui.field}>
              <label htmlFor="confirm" className={ui.fieldLabel}>Confirmer</label>
              <input id="confirm" type="password" required className={ui.input} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            <button type="submit" className={ui.btnPrimary} disabled={loading}>
              {loading ? 'Création…' : 'Créer mon compte →'}
            </button>
          </form>

          <Link to={loginForZone('titres')} className={ui.humanLink}>
            Déjà un compte ? Se connecter
          </Link>
        </div>
      </MobileShell>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <h1 className={styles.brandName}>Comutitres</h1>
          <p className={styles.brandTagline}>Espace mobilité</p>
        </div>

        <h2 className={styles.title}>Créer un compte</h2>

        {error && <div className={styles.alert} role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="firstName" className={styles.label}>Prénom</label>
              <input id="firstName" required className={styles.input} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label htmlFor="lastName" className={styles.label}>Nom</label>
              <input id="lastName" required className={styles.input} value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="birthDate" className={styles.label}>Date de naissance</label>
            <input id="birthDate" type="date" required className={styles.input} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>E-mail</label>
            <input id="email" type="email" required className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Mot de passe</label>
            <input id="password" type="password" required minLength={8} className={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label htmlFor="confirm" className={styles.label}>Confirmer</label>
            <input id="confirm" type="password" required className={styles.input} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>

        <p className={styles.footer}>
          Déjà un compte ?{' '}
          <Link to={loginForZone('mobility')} className={styles.link}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
