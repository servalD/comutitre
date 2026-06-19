import styles from './RecommendationView.module.css'
import type { SubscriptionRecommendation } from '../../domain/subscription-advisor/types'

interface RecommendationViewProps {
  beneficiaryName: string
  recommendation: SubscriptionRecommendation
  submitting?: boolean
  error?: string | null
  onContinue: () => void
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function RecommendationView({
  beneficiaryName,
  recommendation,
  submitting = false,
  error,
  onContinue,
}: RecommendationViewProps) {
  const alternative = recommendation.alternatives?.[0]

  return (
    <div className={styles.root}>
      <p className={styles.intro}>
        Nous avons sélectionné le forfait le plus adapté au profil de {beneficiaryName}
      </p>

      <div className={styles.cards}>
        <div
          className={[styles.card, styles.recommended, styles.active].join(' ')}
        >
          <div className={styles.cardTop}>
            <div className={styles.cardLeft}>
              <span className={styles.recommendedBadge}>
                ★ Recommandé pour {beneficiaryName}
              </span>
              <h3 className={styles.productName}>{recommendation.productLabel}</h3>
              <p className={styles.price}>{recommendation.tariffLabel}</p>
              <p className={styles.priceMonthly}>{recommendation.summary}</p>
            </div>
            <div className={styles.cardVisual} aria-hidden="true">
              <span className={styles.cardBrand}>navigo</span>
              <span className={styles.cardLogo}>R</span>
            </div>
          </div>
          <ul className={styles.features}>
            {recommendation.why.map((line) => (
              <li key={line}>
                <span className={styles.check}><CheckIcon /></span>
                {line}
              </li>
            ))}
          </ul>
        </div>

        {alternative ? (
          <div className={[styles.card, styles.alternative].join(' ')}>
            <div className={styles.altHeader}>
              <span className={styles.altBadge}>Alternative</span>
            </div>
            <h3 className={styles.altName}>{alternative.productLabel}</h3>
            <p className={styles.altDesc}>{alternative.reason}</p>
          </div>
        ) : null}
      </div>

      {recommendation.usageNote ? (
        <p className={styles.intro}>{recommendation.usageNote}</p>
      ) : null}

      <section className={styles.docsSection}>
        <h4 className={styles.docsTitle}>Documents nécessaires</h4>
        <div className={styles.docsList}>
          {recommendation.documentLabels.map((doc) => (
            <div key={doc} className={styles.docItem}>
              <span className={styles.docIcon}><DocIcon /></span>
              <span className={styles.docLabel}>{doc}</span>
            </div>
          ))}
        </div>
      </section>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.continueBtn}
          onClick={onContinue}
          disabled={submitting}
        >
          {submitting ? 'Création du dossier…' : 'Continuer avec ce forfait'}
        </button>
      </div>
    </div>
  )
}
