import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { MobilityIdentityWithRelationships } from '../../domain/types/mobility'
import { useLabels } from '../../constants/labels'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import styles from './IdentityCard.module.css'

interface IdentityCardProps {
  identity: MobilityIdentityWithRelationships
  activeProductLabel?: string | null
}

export function IdentityCard({ identity, activeProductLabel }: IdentityCardProps) {
  const navigate = useNavigate()
  const { t } = useTranslation('mobility')
  const { profileLabels, relationshipLabels } = useLabels()

  return (
    <Card
      as="button"
      onClick={() => navigate(`/mobility/${identity.id}`)}
      className={styles.card}
    >
      <div className={styles.avatar} aria-hidden="true">
        {identity.calculatedAge < 18 ? '👦' : '👤'}
      </div>
      <div className={styles.content}>
        <h3>
          {identity.firstName} {identity.lastName}
        </h3>
        <p className={styles.meta}>
          {profileLabels[identity.currentProfile]} ·{' '}
          {t('identity.ageYears', { count: identity.calculatedAge })}
        </p>
        {activeProductLabel ? (
          <p className={styles.product}>
            <span aria-hidden="true">🎫</span> {activeProductLabel}
          </p>
        ) : (
          <p className={styles.productMuted}>{t('identity.noActiveSubscription')}</p>
        )}
        <div className={styles.badges}>
          {identity.relationships.map((rel) => (
            <Badge key={rel.id} tone="info" icon="🔗">
              {relationshipLabels[rel.relationshipType]}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  )
}
