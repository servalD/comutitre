import styles from './RecommendationView.module.css'
import type { SubscriptionProductId } from '../../data/mock'
import { MOCK_SUBSCRIPTION } from '../../data/mock'

interface RecommendationViewProps {
  beneficiaryName: string
  selectedId: SubscriptionProductId
  onSelect: (id: SubscriptionProductId) => void
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

export function RecommendationView({ beneficiaryName, selectedId, onSelect, onContinue }: RecommendationViewProps) {
  const { products } = MOCK_SUBSCRIPTION
  const recommended = products.find((p) => p.id === 'imagine-r-junior')!
  const alternative = products.find((p) => p.id === 'imagine-r-scolaire')!
  const selected = products.find((p) => p.id === selectedId) ?? recommended

  return (
    <div className={styles.root}>
      <p className={styles.intro}>
        Nous avons sélectionné le forfait le plus adapté à votre profil
      </p>

      <div className={styles.cards}>
        <button
          type="button"
          className={[styles.card, styles.recommended, selectedId === recommended.id ? styles.active : ''].filter(Boolean).join(' ')}
          onClick={() => onSelect(recommended.id)}
        >
          <div className={styles.cardTop}>
            <div className={styles.cardLeft}>
              <span className={styles.recommendedBadge}>
                ★ Recommandé pour {beneficiaryName}
              </span>
              <h3 className={styles.productName}>{recommended.label}</h3>
              <p className={styles.price}>{recommended.price}</p>
              <p className={styles.priceMonthly}>Soit {recommended.priceMonthly}</p>
            </div>
            <div className={styles.cardVisual} aria-hidden="true">
              <span className={styles.cardBrand}>imagine</span>
              <span className={styles.cardLogo}>R</span>
            </div>
          </div>
          <ul className={styles.features}>
            {recommended.features.map((f) => (
              <li key={f}>
                <span className={styles.check}><CheckIcon /></span>
                {f}
              </li>
            ))}
          </ul>
        </button>

        <button
          type="button"
          className={[styles.card, styles.alternative, selectedId === alternative.id ? styles.active : ''].filter(Boolean).join(' ')}
          onClick={() => onSelect(alternative.id)}
        >
          <div className={styles.altHeader}>
            <span className={styles.altBadge}>Alternative</span>
          </div>
          <h3 className={styles.altName}>{alternative.label}</h3>
          <p className={styles.altPrice}>{alternative.price}</p>
          <p className={styles.altDesc}>{alternative.description}</p>
        </button>
      </div>

      <section className={styles.docsSection}>
        <h4 className={styles.docsTitle}>Documents nécessaires</h4>
        <div className={styles.docsList}>
          {selected.requiredDocuments.map((doc) => (
            <div key={doc} className={styles.docItem}>
              <span className={styles.docIcon}><DocIcon /></span>
              <span className={styles.docLabel}>{doc}</span>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.footer}>
        <button type="button" className={styles.continueBtn} onClick={onContinue}>
          Continuer avec ce forfait
        </button>
        <button type="button" className={styles.otherLink} onClick={() => onSelect(alternative.id)}>
          Voir les autres forfaits
        </button>
      </div>
    </div>
  )
}
