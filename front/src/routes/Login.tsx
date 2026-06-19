import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { PublicAppFrame } from '../components/layout/PublicAppFrame'
import { authApi } from '../api/auth'
import { useAuth } from '../contexts/AuthContext'
import {
  consumePostAuthRedirect,
  homeForZone,
  registerForZone,
  rememberPostAuthRedirect,
  type AuthZone,
} from '../auth/auth-zones'
import styles from './Login.module.css'

interface LoginProps {
  zone?: AuthZone
}

function resolveAfterAuth(zone: AuthZone, from: string | undefined): string {
  if (from && from.startsWith('/')) {
    return from
  }
  return homeForZone(zone)
}

function MailIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 7l8 5.5L18 7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 9V7a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <ellipse cx="10" cy="10" rx="7" ry="4.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="2" fill="currentColor" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 3l14 14M8.5 8.7A2 2 0 0011.3 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4.5 6C3 7.2 2 8.6 2 10c0 2.5 3.6 5.5 8 5.5 1.5 0 2.9-.4 4-1M16.5 13.5C17.9 12.3 18 11 18 10c0-2.5-3.6-5.5-8-5.5-.9 0-1.8.1-2.6.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function Login({ zone = 'mobility' }: LoginProps) {
  const { login } = useAuth()
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function afterLogin(accessToken: string) {
    await login(accessToken)
    const target = consumePostAuthRedirect(resolveAfterAuth(zone, from))
    navigate(target, { replace: true })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { accessToken } = await authApi.login({ email, password })
      await afterLogin(accessToken)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  async function handleFranceConnect() {
    setError(null)
    rememberPostAuthRedirect(resolveAfterAuth(zone, from))
    setLoading(true)
    try {
      if (import.meta.env.VITE_MOCK_AUTH === 'true') {
        const { accessToken } = await authApi.loginWithFranceConnect()
        await afterLogin(accessToken)
        return
      }
      window.location.href = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'}/auth/franceconnect/login`
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
      setLoading(false)
    }
  }

  return (
    <PublicAppFrame variant="white">
      <main className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logoWrap}>
            <img
              src="/images/comutitres-logo.svg"
              alt="Comutitres"
              className={styles.logo}
            />
          </div>

          <h1 className={styles.title}>{t('login.title')}</h1>

          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {/* Email */}
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                {t('login.email')}
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><MailIcon /></span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={styles.input}
                  placeholder={t('login.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>
                {t('login.password')}
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><LockIcon /></span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>

            {/* Mot de passe oublié */}
            <div className={styles.forgotRow}>
              <a href="#" className={styles.forgotLink}>{t('login.forgot')}</a>
            </div>

            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading && <span className={styles.spinner} aria-hidden="true" />}
              {loading ? t('login.connecting') : t('login.submit')}
            </button>
          </form>

          {/* Séparateur */}
          <div className={styles.divider}><span>{t('or')}</span></div>

          {/* FranceConnect */}
          <button
            type="button"
            className={styles.btnFC}
            onClick={handleFranceConnect}
            disabled={loading}
          >
            <span className={styles.fcLogoWrap}>
              <img
                src="/images/logo-france-connect.png"
                alt="FranceConnect"
                className={styles.fcLogo}
              />
            </span>
            <span>{t('login.franceConnect')}</span>
          </button>

          {/* Créer un compte */}
          <p className={styles.createRow}>
            <Link to={registerForZone(zone)} className={styles.createLink}>
              {t('login.createAccount')} <span aria-hidden="true">›</span>
            </Link>
          </p>

          {/* CGU */}
          <p className={styles.legal}>
            <Trans
              i18nKey="login.legal"
              ns="auth"
              components={{
                cgu: (
                  <a
                    href="https://www.comutitres.fr/cgu"
                    className={styles.legalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
              }}
            />
          </p>

        </div>
      </main>
    </PublicAppFrame>
  )
}
