import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { mobilityApi } from '../../api/mobility-api'
import { ApiError } from '../../api/http-client'
import type { MobilityIdentity } from '../../domain/types/mobility'
import { SubscribeWizard } from '../../components/mobility/subscribe/SubscribeWizard'
import styles from './MobilityPages.module.css'

export function SubscribePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation('mobility')
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
          setError(err instanceof ApiError ? err.message : t('subscribe.loadError'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, t])

  if (!id) return <p className={styles.status}>{t('subscribe.notFound')}</p>
  if (loading) return <p className={styles.loading}>{t('common:loading')}</p>
  if (error || !identity) {
    return <p className={styles.status}>{error ?? t('subscribe.notFound')}</p>
  }

  return (
    <div className={styles.page}>
      <Link to={`/mobility/${id}`} className={styles.back}>
        <span aria-hidden="true">←</span> {t('subscribe.backToDetail')}
      </Link>
      <header className={styles.header}>
        <div>
          <h1>{t('subscribe.title')}</h1>
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
