import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getFranceConnectLoginUrl } from '../../api/mobility-api'
import { useAuth } from '../../auth/use-auth'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field } from '../../components/ui/Field'
import { inputClassName } from '../../components/ui/field-class-names'
import styles from './AuthPages.module.css'

export function LoginPage() {
  const { setToken, isAuthenticated } = useAuth()
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const [devToken, setDevToken] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/mobility" replace />
  }

  function handleFranceConnect() {
    window.location.href = getFranceConnectLoginUrl()
  }

  function handleDevLogin(e: FormEvent) {
    e.preventDefault()
    const trimmed = devToken.trim()
    if (!trimmed) return
    setToken(trimmed)
    navigate('/mobility', { replace: true })
  }

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <div className={styles.hero}>
          <span className={styles.icon} aria-hidden="true">
            🚇
          </span>
          <h1>{t('devLogin.title')}</h1>
          <p>{t('devLogin.subtitle')}</p>
        </div>

        <Button onClick={handleFranceConnect} className={styles.fullWidth}>
          <span aria-hidden="true">🇫🇷</span> {t('devLogin.franceConnect')}
        </Button>

        <div className={styles.divider}>
          <span>{t('devLogin.orDev')}</span>
        </div>

        <form onSubmit={handleDevLogin}>
          <Field
            label={t('devLogin.tokenLabel')}
            htmlFor="devToken"
            hint={t('devLogin.tokenHint')}
          >
            <input
              id="devToken"
              className={inputClassName()}
              value={devToken}
              onChange={(e) => setDevToken(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIs..."
              autoComplete="off"
            />
          </Field>
          <Button type="submit" variant="secondary" className={styles.fullWidth}>
            {t('devLogin.useToken')}
          </Button>
        </form>

        <p className={styles.footer}>
          <Link to="/mobility">{t('common:actions.back')}</Link>
        </p>
      </Card>
    </div>
  )
}
