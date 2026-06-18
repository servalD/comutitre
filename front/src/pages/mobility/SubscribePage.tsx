import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { mobilityApi } from '../../api/mobility-api'
import { ApiError } from '../../api/http-client'
import type { MobilityIdentity } from '../../domain/types/mobility'
import { SubscribeWizard } from '../../components/mobility/subscribe/SubscribeWizard'
import styles from './MobilityPages.module.css'

export function SubscribePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [identity, setIdentity] = useState<MobilityIdentity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    mobilityApi
      .getIdentity(id)
      .then((data) => {
        if (!cancelled) setIdentity(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Chargement impossible')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (!id) return <p className={styles.status}>Identité introuvable.</p>
  if (loading) return <p className={styles.loading}>Chargement…</p>
  if (error || !identity) {
    return <p className={styles.status}>{error ?? 'Identité introuvable.'}</p>
  }

  return (
    <div className={styles.page}>
      <Link to={`/mobility/${id}`} className={styles.back}>
        <span aria-hidden="true">←</span> Retour à la fiche
      </Link>
      <header className={styles.header}>
        <div>
          <h1>Souscrire un forfait</h1>
          <p>
            {identity.firstName} {identity.lastName}
          </p>
        </div>
      </header>

      <SubscribeWizard
        identity={identity}
        onCancel={() => navigate(`/mobility/${id}`, { replace: true })}
      />
    </div>
  )
}
