import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { getFranceConnectLoginUrl } from '../../api/mobility-api'
import { useAuth } from '../../auth/use-auth'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field } from '../../components/ui/Field'
import { inputClassName } from '../../components/ui/field-class-names'
import styles from './AuthPages.module.css'

export function LoginPage() {
  const { setToken, isAuthenticated } = useAuth()
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
          <h1>Comutitres Mobilité</h1>
          <p>Connectez-vous pour gérer vos identités de mobilité.</p>
        </div>

        <Button onClick={handleFranceConnect} className={styles.fullWidth}>
          <span aria-hidden="true">🇫🇷</span> Se connecter avec FranceConnect
        </Button>

        <div className={styles.divider}>
          <span>ou mode développement</span>
        </div>

        <form onSubmit={handleDevLogin}>
          <Field
            label="Token JWT"
            htmlFor="devToken"
            hint="Collez le token reçu après FranceConnect mock"
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
            Utiliser ce token
          </Button>
        </form>

        <p className={styles.footer}>
          <Link to="/mobility">Retour</Link>
        </p>
      </Card>
    </div>
  )
}
