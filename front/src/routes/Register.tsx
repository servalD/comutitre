import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { PublicAppFrame } from '../components/layout/PublicAppFrame'
import { authApi } from '../api/auth'
import { useAuth } from '../contexts/AuthContext'
import {
  consumePostAuthRedirect,
  homeForZone,
  loginForZone,
  type AuthZone,
} from '../auth/auth-zones'
import ls from './Login.module.css'
import styles from './Register.module.css'

interface RegisterProps {
  zone?: AuthZone
}

type RegisterStep = 'form' | 'match' | 'code'

function resolveAfterAuth(zone: AuthZone, from: string | undefined): string {
  if (from && from.startsWith('/')) return from
  return homeForZone(zone)
}

function UserIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 7l8 5.5L18 7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 2v3M14 2v3M2 8h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

export default function Register({ zone = 'mobility' }: RegisterProps) {
  const { login } = useAuth()
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  const [step, setStep] = useState<RegisterStep>('form')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [maskedHolder, setMaskedHolder] = useState<string | null>(null)
  const [maskedGuardianEmail, setMaskedGuardianEmail] = useState<string | null>(null)
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const title =
    step === 'form'
      ? t('register.title')
      : step === 'match'
        ? 'Profil mobilité trouvé'
        : 'Vérification par e-mail'

  async function finishAuth(accessToken: string) {
    await login(accessToken)
    const target = consumePostAuthRedirect(resolveAfterAuth(zone, from))
    navigate(target, { replace: true })
  }

  function validatePasswords(): boolean {
    if (password !== confirm) {
      setError(t('register.passwordMismatch'))
      return false
    }
    if (password.length < 8) {
      setError(t('register.passwordTooShort'))
      return false
    }
    return true
  }

  async function handleFormSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!validatePasswords()) return

    setLoading(true)
    try {
      const match = await authApi.checkIdentityMatch({ firstName, lastName, birthDate })
      if (match.matched && match.recoveryEligible) {
        setMaskedHolder(match.maskedHolder ?? null)
        setStep('match')
        return
      }

      const { accessToken } = await authApi.register({
        firstName,
        lastName,
        birthDate,
        email,
        password,
      })
      await finishAuth(accessToken)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  async function handleRequestRecovery() {
    setError(null)
    setLoading(true)
    try {
      const response = await authApi.requestRecovery({
        firstName,
        lastName,
        birthDate,
        email,
        password,
      })
      setMaskedGuardianEmail(response.maskedGuardianEmail ?? null)
      setDevCodeHint(response.devCode ?? null)
      setStep('code')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCompleteRecovery(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (verificationCode.length !== 6) {
      setError('Le code doit contenir 6 chiffres.')
      return
    }

    setLoading(true)
    try {
      const { accessToken } = await authApi.completeRecovery({
        email,
        code: verificationCode,
      })
      await finishAuth(accessToken)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PublicAppFrame variant="white">
      <main className={ls.page}>
        <div className={ls.card}>
          <div className={ls.logoWrap}>
            <img
              src="/images/comutitres-logo.svg"
              alt="Comutitres"
              className={ls.logo}
            />
          </div>

          <h1 className={ls.title}>{title}</h1>

          {error && (
            <div className={ls.error} role="alert">
              {error}
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={handleFormSubmit} className={ls.form} noValidate>
              <div className={styles.row}>
                <div className={ls.field}>
                  <label htmlFor="firstName" className={ls.label}>{t('register.firstName')}</label>
                  <div className={ls.inputWrap}>
                    <span className={ls.inputIcon}><UserIcon /></span>
                    <input
                      id="firstName"
                      required
                      className={ls.input}
                      placeholder={t('register.firstNamePlaceholder')}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                </div>
                <div className={ls.field}>
                  <label htmlFor="lastName" className={ls.label}>{t('register.lastName')}</label>
                  <div className={ls.inputWrap}>
                    <span className={ls.inputIcon}><UserIcon /></span>
                    <input
                      id="lastName"
                      required
                      className={ls.input}
                      placeholder={t('register.lastNamePlaceholder')}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className={ls.field}>
                <label htmlFor="birthDate" className={ls.label}>{t('register.birthDate')}</label>
                <div className={ls.inputWrap}>
                  <span className={ls.inputIcon}><CalendarIcon /></span>
                  <input
                    id="birthDate"
                    type="date"
                    required
                    className={ls.input}
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                </div>
              </div>

              <div className={ls.field}>
                <label htmlFor="email" className={ls.label}>{t('login.email')}</label>
                <div className={ls.inputWrap}>
                  <span className={ls.inputIcon}><MailIcon /></span>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={ls.input}
                    placeholder={t('login.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className={ls.field}>
                <label htmlFor="password" className={ls.label}>{t('login.password')}</label>
                <div className={ls.inputWrap}>
                  <span className={ls.inputIcon}><LockIcon /></span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className={ls.input}
                    placeholder={t('register.passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className={ls.eyeBtn}
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? t('register.hide') : t('register.show')}
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
              </div>

              <div className={ls.field}>
                <label htmlFor="confirm" className={ls.label}>{t('register.confirmPassword')}</label>
                <div className={ls.inputWrap}>
                  <span className={ls.inputIcon}><LockIcon /></span>
                  <input
                    id="confirm"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className={ls.input}
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                  <button
                    type="button"
                    className={ls.eyeBtn}
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? t('register.hide') : t('register.show')}
                  >
                    <EyeIcon visible={showConfirm} />
                  </button>
                </div>
              </div>

              <button type="submit" className={ls.btnPrimary} disabled={loading}>
                {loading && <span className={ls.spinner} aria-hidden="true" />}
                {loading ? t('register.creating') : t('register.submit')}
              </button>
            </form>
          )}

          {step === 'match' && (
            <div className={styles.recoveryPanel}>
              <p className={styles.recoveryLead}>
                Nous avons retrouvé un profil mobilité existant
                {maskedHolder ? ` (${maskedHolder})` : ''}. Vous pouvez récupérer
                votre historique de titres et documents en créant votre compte
                personnel. Un code de validation sera envoyé à votre responsable
                légal.
              </p>
              <button
                type="button"
                className={ls.btnPrimary}
                disabled={loading}
                onClick={() => void handleRequestRecovery()}
              >
                {loading && <span className={ls.spinner} aria-hidden="true" />}
                {loading ? 'Envoi du code…' : 'Récupérer mon historique'}
              </button>
              <button
                type="button"
                className={styles.secondaryBtn}
                disabled={loading}
                onClick={() => {
                  setStep('form')
                  setError(null)
                }}
              >
                Modifier mes informations
              </button>
            </div>
          )}

          {step === 'code' && (
            <form onSubmit={handleCompleteRecovery} className={ls.form} noValidate>
              <p className={styles.recoveryLead}>
                Demandez le code à 6 chiffres à votre responsable légal
                {maskedGuardianEmail ? (
                  <> (envoyé à <strong>{maskedGuardianEmail}</strong>)</>
                ) : (
                  <> puis saisissez-le ci-dessous</>
                )}
                .
              </p>
              {devCodeHint && (
                <p className={styles.devHint} role="status">
                  Mode démo — code envoyé au responsable légal :{' '}
                  <strong>{devCodeHint}</strong>
                </p>
              )}
              <div className={ls.field}>
                <label htmlFor="code" className={ls.label}>Code de vérification</label>
                <div className={ls.inputWrap}>
                  <span className={ls.inputIcon}><LockIcon /></span>
                  <input
                    id="code"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    className={ls.input}
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                  />
                </div>
              </div>
              <button type="submit" className={ls.btnPrimary} disabled={loading}>
                {loading && <span className={ls.spinner} aria-hidden="true" />}
                {loading ? 'Validation…' : 'Valider et accéder à mon espace'}
              </button>
            </form>
          )}

          <p className={ls.createRow}>
            <Link to={loginForZone(zone)} className={ls.createLink}>
              {t('register.haveAccount')} <span aria-hidden="true">›</span>
            </Link>
          </p>

          <p className={ls.legal}>
            <Trans
              i18nKey="login.legal"
              ns="auth"
              components={{
                cgu: (
                  <a
                    href="https://www.comutitres.fr/cgu"
                    className={ls.legalLink}
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
