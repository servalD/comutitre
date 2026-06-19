import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ProgressBar } from '../ui/ProgressBar'
import { Stepper } from '../ui/Stepper'
import {
  formatDossierDate,
  dossierDetailPath,
  type SubscriptionDossierView,
} from '../../domain/subscription-dossier'
import styles from './SubscriptionDossierCards.module.css'

function DossierIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="14 2 14 8 20 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="9" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="17" x2="13" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 18l6-6-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface FeaturedCardProps {
  dossier: SubscriptionDossierView
  showSyncNote?: boolean
  totalPending?: number
}

export function SubscriptionDossierFeaturedCard({
  dossier,
  showSyncNote = false,
  totalPending = 1,
}: FeaturedCardProps) {
  const hasMultiple = totalPending > 1
  const actionHref = hasMultiple ? '/dossier' : dossierDetailPath(dossier)
  const actionLabel = hasMultiple
    ? `Mes dossiers en cours (${totalPending})`
    : 'Ouvrir le dossier'

  return (
    <Card className={styles.featuredCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleRow}>
          <span className={styles.iconOrange} aria-hidden="true">
            <DossierIcon />
          </span>
          <div>
            <h2 className={styles.cardTitle}>Dossier en cours</h2>
            <p className={styles.cardSubtitle}>
              {dossier.product} pour {dossier.beneficiaryFirstName}
            </p>
            {hasMultiple && (
              <p className={styles.multiHint}>
                Dernière activité · {totalPending - 1} autre
                {totalPending - 1 > 1 ? 's' : ''} dossier
                {totalPending - 1 > 1 ? 's' : ''} en cours
              </p>
            )}
          </div>
        </div>
        <span className={styles.statusBadge}>{dossier.statusLabel}</span>
      </div>

      <dl className={styles.registeredSummary}>
        <div>
          <dt>Bénéficiaire</dt>
          <dd>{dossier.beneficiaryFullName}</dd>
        </div>
        <div>
          <dt>Payeur</dt>
          <dd>{dossier.payerFullName}</dd>
        </div>
        <div>
          <dt>Créé le</dt>
          <dd>{formatDossierDate(dossier.createdAt)}</dd>
        </div>
        {dossier.documentsRequired > 0 && (
          <div>
            <dt>Justificatifs</dt>
            <dd>
              {dossier.documentsDeposed}/{dossier.documentsRequired} déposés
            </dd>
          </div>
        )}
      </dl>

      <div className={styles.stepperWrap}>
        <Stepper steps={dossier.steps} currentStep={dossier.currentStep} />
      </div>

      <ProgressBar value={dossier.currentStep} max={dossier.totalSteps} />

      <div className={styles.dossierFooter}>
        <div className={styles.dossierMeta}>
          <span className={styles.stepLabel}>
            Étape {dossier.currentStep} sur {dossier.totalSteps}
          </span>
          <span className={styles.stepHint}>{dossier.stepHint}</span>
        </div>
        <Link to={actionHref} className={styles.continueLink}>
          <Button>
            {actionLabel}
            <ChevronRight />
          </Button>
        </Link>
      </div>
      {showSyncNote && (
        <p className={styles.syncNote}>Synchronisé avec votre souscription</p>
      )}
    </Card>
  )
}

interface CompactCardProps {
  dossier: SubscriptionDossierView
}

export function SubscriptionDossierCompactCard({ dossier }: CompactCardProps) {
  const progressParts = [
    `Étape ${dossier.currentStep}/${dossier.totalSteps}`,
  ]
  if (dossier.documentsRequired > 0) {
    progressParts.push(
      `${dossier.documentsDeposed}/${dossier.documentsRequired} justificatifs`,
    )
  }

  return (
    <Card className={styles.compactCard}>
      <div className={styles.compactTop}>
        <div className={styles.compactInfo}>
          <p className={styles.compactProduct}>
            {dossier.product} · {dossier.beneficiaryFirstName}
          </p>
          <p className={styles.compactMeta}>{progressParts.join(' · ')}</p>
        </div>
        <span className={styles.statusBadge}>{dossier.statusLabel}</span>
      </div>
      <div className={styles.compactFooter}>
        <span className={styles.compactDate}>
          Créé le {formatDossierDate(dossier.createdAt)}
        </span>
        <Link
          to={dossierDetailPath(dossier)}
          className={styles.continueLink}
        >
          <Button variant="secondary">Compléter</Button>
        </Link>
      </div>
    </Card>
  )
}

interface EmptyCardProps {
  title?: string
}

export function SubscriptionDossierEmptyCard({
  title = 'Dossier en cours',
}: EmptyCardProps) {
  return (
    <Card className={styles.featuredCard}>
      <div className={styles.cardTitleRow}>
        <span className={styles.iconOrange} aria-hidden="true">
          <DossierIcon />
        </span>
        <div>
          <h2 className={styles.cardTitle}>{title}</h2>
          <p className={styles.cardSubtitle}>Aucune souscription en cours</p>
        </div>
      </div>
      <p className={styles.emptyText}>
        Lancez une nouvelle souscription pour créer un dossier. Les informations
        enregistrées apparaîtront ici dès la confirmation du forfait.
      </p>
      <Link to="/souscription/nouvelle" className={styles.continueLink}>
        <Button>Nouvelle souscription</Button>
      </Link>
    </Card>
  )
}

interface ActionAlertProps {
  needsJustificatifs: boolean
  needsSignature: boolean
}

export function SubscriptionDossierActionAlert({
  needsJustificatifs,
  needsSignature,
}: ActionAlertProps) {
  if (!needsJustificatifs && !needsSignature) return null

  return (
    <div className={styles.alertStack} role="status">
      {needsJustificatifs && (
        <div className={styles.alertBanner}>
          <span aria-hidden="true">⚠</span>
          <p>Un ou plusieurs dossiers nécessitent des justificatifs.</p>
        </div>
      )}
      {needsSignature && (
        <div className={styles.alertBanner}>
          <span aria-hidden="true">✍</span>
          <p>Un ou plusieurs dossiers sont en attente de signature.</p>
        </div>
      )}
    </div>
  )
}
