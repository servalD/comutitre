import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/use-auth'
import styles from './AuthPages.module.css'

function parseAccessTokenFromHash(hash: string): string | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  return params.get('access_token')
}

export function AuthCallbackPage() {
  const { setToken } = useAuth()
  const navigate = useNavigate()
  const token = useMemo(() => parseAccessTokenFromHash(window.location.hash), [])

  useEffect(() => {
    if (!token) return
    setToken(token)
    navigate('/mobility', { replace: true })
  }, [token, setToken, navigate])

  if (!token) {
    return (
      <div className={styles.page}>
        <p className={styles.error}>
          Aucun token reçu. Relancez la connexion FranceConnect.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <p>Connexion en cours…</p>
    </div>
  )
}
