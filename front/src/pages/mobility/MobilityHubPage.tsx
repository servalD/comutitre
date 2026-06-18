import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mobilityApi } from '../../api/mobility-api'
import { ApiError } from '../../api/http-client'
import type { MobilityIdentityWithRelationships } from '../../domain/types/mobility'
import { IdentityCard } from '../../components/mobility/IdentityCard'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import styles from './MobilityPages.module.css'

export function MobilityHubPage() {
  const navigate = useNavigate()
  const [identities, setIdentities] = useState<MobilityIdentityWithRelationships[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    mobilityApi
      .listMyIdentities()
      .then((data) => {
        if (!cancelled) setIdentities(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Erreur de chargement')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return <p className={styles.loading}>Chargement des identités…</p>
  }

  if (error) {
    return <p className={styles.status}>{error}</p>
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Mes identités de mobilité</h1>
          <p>Gérez les profils de votre foyer et leurs abonnements.</p>
        </div>
        <Button onClick={() => navigate('/mobility/new')}>
          <span aria-hidden="true">➕</span> Ajouter une personne
        </Button>
      </header>

      {identities.length === 0 ? (
        <EmptyState
          icon="👤"
          title="Aucune identité"
          description="Créez une première identité de mobilité pour commencer."
          action={
            <Button onClick={() => navigate('/mobility/new')}>Créer une identité</Button>
          }
        />
      ) : (
        <div className={styles.grid}>
          {identities.map((identity) => (
            <IdentityCard key={identity.id} identity={identity} />
          ))}
        </div>
      )}
    </div>
  )
}
