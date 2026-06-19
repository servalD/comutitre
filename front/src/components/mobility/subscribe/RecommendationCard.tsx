import { useTranslation } from 'react-i18next'
import type { SubscriptionRecommendation } from '../../../domain/subscription-advisor/types'
import { Badge } from '../../ui/Badge'
import { Card } from '../../ui/Card'
import styles from './SubscribeWizard.module.css'

interface RecommendationCardProps {
  recommendation: SubscriptionRecommendation
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const { t } = useTranslation('mobility')
  return (
    <Card className={styles.recommendation}>
      <div className={styles.productHeader}>
        <span aria-hidden="true">🎫</span>
        <h2>{recommendation.productLabel}</h2>
        <Badge tone="success">{t('recommendation.recommended')}</Badge>
      </div>

      <p>{recommendation.summary}</p>

      <p>
        <strong>{recommendation.tariffLabel}</strong>
      </p>

      <div>
        <strong>{t('recommendation.why')}</strong>
        <ul className={styles.whyList}>
          {recommendation.why.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <div className={styles.docs}>
        <strong>{t('recommendation.documents')}</strong>
        <ul>
          {recommendation.documentLabels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      </div>

      {recommendation.alternatives && recommendation.alternatives.length > 0 ? (
        <div className={styles.alternatives}>
          <strong>{t('recommendation.alternative')}</strong>{' '}
          {recommendation.alternatives.map((alt) => (
            <span key={alt.productLabel}>
              {alt.productLabel} — {alt.reason}
            </span>
          ))}
        </div>
      ) : null}

      {recommendation.usageNote ? (
        <p className={styles.usageNote}>{recommendation.usageNote}</p>
      ) : null}
    </Card>
  )
}
