import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { mobilityApi } from '../../api/mobility-api'
import { ApiError } from '../../api/http-client'
import type { MobilityIdentityWithRelationships } from '../../domain/types/mobility'
import { IdentityCard } from '../../components/mobility/IdentityCard'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import styles from './MobilityPages.module.css'

export function MobilityHubPage() {
  const navigate = useNavigate()
  const { t } = useTranslation('mobility')
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
          setError(err instanceof ApiError ? err.message : t('common:errors.loading'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [t])

  if (loading) {
    return <p className={styles.loading}>{t('hub.loading')}</p>
  }

  if (error) {
    return <p className={styles.status}>{error}</p>
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>{t('hub.title')}</h1>
          <p>{t('hub.subtitle')}</p>
        </div>
        <Button onClick={() => navigate('/mobility/new')}>
          <span aria-hidden="true">➕</span> {t('hub.addPerson')}
        </Button>
      </header>

      {identities.length === 0 ? (
        <EmptyState
          icon="👤"
          title={t('hub.emptyTitle')}
          description={t('hub.emptyDescription')}
          action={
            <Button onClick={() => navigate('/mobility/new')}>{t('hub.createIdentity')}</Button>
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
