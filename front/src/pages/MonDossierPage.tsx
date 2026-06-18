import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DocumentRow } from '../components/ui/DocumentRow'
import { InfoBanner } from '../components/ui/InfoBanner'
import { Stepper } from '../components/ui/Stepper'
import { UploadZone } from '../components/ui/UploadZone'
import { MOCK_DOSSIER_DETAIL } from '../data/mock'
import styles from './MonDossierPage.module.css'

function IdCardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="8" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
      <path d="M14 10h4M14 14h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function SchoolIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22 10l-10-5L2 10l10 5 10-5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function PhotoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function DocIcon() {
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
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={open ? styles.chevronOpen : styles.chevron}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function UploadCloudIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const DOC_ICONS: Record<string, ReactNode> = {
  'id-card': <IdCardIcon />,
  school: <SchoolIcon />,
  photo: <PhotoIcon />,
}

export function MonDossierPage() {
  const navigate = useNavigate()
  const {
    product,
    beneficiaryFullName,
    beneficiaryCharacter,
    currentStep,
    steps,
    justificatifs,
    processingDelay,
  } = MOCK_DOSSIER_DETAIL

  const [accordionOpen, setAccordionOpen] = useState(true)

  return (
    <AppLayout activeTab="accueil">
      <div className={styles.page}>
        <PageHeader title="Mon dossier" backTo="/espace" />

        <section className={styles.summary} aria-label="Résumé du dossier">
          <div className={styles.cardVisual} aria-hidden="true">
            <div className={styles.cardChip} />
            <span className={styles.cardBrand}>Imagine R</span>
            <span className={styles.cardType}>Junior</span>
          </div>
          <div className={styles.summaryInfo}>
            <h2 className={styles.productName}>{product}</h2>
            <p className={styles.beneficiary}>
              <Avatar
                name={beneficiaryFullName}
                size="sm"
                character={beneficiaryCharacter}
              />
              {beneficiaryFullName}
            </p>
          </div>
        </section>

        <div className={styles.stepperSection}>
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        <div className={styles.content}>
          <section className={styles.documentsPanel} aria-label="Justificatifs">
            <Card className={styles.accordionCard}>
              <button
                type="button"
                className={styles.accordionHeader}
                onClick={() => setAccordionOpen((open) => !open)}
                aria-expanded={accordionOpen}
              >
                <span className={styles.accordionTitleRow}>
                  <span className={styles.accordionIcon} aria-hidden="true">
                    <DocIcon />
                  </span>
                  <span className={styles.accordionTitle}>Justificatifs</span>
                </span>
                <ChevronIcon open={accordionOpen} />
              </button>

              {accordionOpen && (
                <div className={styles.accordionBody}>
                  <p className={styles.instruction}>
                    Déposez les documents suivants pour continuer votre demande.
                  </p>

                  <div className={styles.documentList}>
                    {justificatifs.map((doc) => (
                      <DocumentRow
                        key={doc.id}
                        icon={DOC_ICONS[doc.id]}
                        label={doc.label}
                        status={doc.status}
                        statusLabel={doc.statusLabel}
                      />
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </section>

          <aside className={styles.actionsPanel} aria-label="Dépôt de documents">
            <UploadZone />
            <InfoBanner>{processingDelay}</InfoBanner>
            <Button fullWidth className={styles.submitBtn} onClick={() => navigate('/dossier/signature')}>
              <UploadCloudIcon />
              Déposer mes justificatifs
            </Button>
          </aside>
        </div>
      </div>
    </AppLayout>
  )
}
