import { Link } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Stepper } from '../components/ui/Stepper'
import { useHouseholdData } from '../hooks/useHouseholdData'
import styles from './MonEspacePage.module.css'

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

function FoyerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function statusClass(status: string) {
  if (status.includes('actif')) return styles.statusActive
  if (status.includes('cours')) return styles.statusPending
  return styles.statusNeutral
}

export function MonEspacePage() {
  const {
    greetingFirstName,
    members,
    dossier,
    loading,
    error,
  } = useHouseholdData()

  const {
    product,
    beneficiaryFirstName,
    currentStep,
    totalSteps,
    steps,
    stepHint,
  } = dossier

  return (
    <AppLayout activeTab="accueil">
      <div className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow}>Espace client</p>
            <h1 className={styles.title}>Mon espace</h1>
            <p className={styles.hello}>
              Bonjour, <strong>{greetingFirstName}</strong> — retrouvez ici vos
              démarches et les personnes de votre foyer.
            </p>
            {error && (
              <p className={styles.loadError} role="status">
                {error} Affichage de démonstration.
              </p>
            )}
          </div>
          <Link to="/souscription/nouvelle" className={styles.heroCta}>
            <Button className={styles.heroCtaBtn}>
              <PlusIcon />
              Nouvelle souscription
            </Button>
          </Link>
        </header>

        <div className={styles.grid}>
          <section className={styles.primary} aria-label="Dossier en cours">
            <Card className={styles.dossierCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleRow}>
                  <span className={styles.iconOrange} aria-hidden="true">
                    <DossierIcon />
                  </span>
                  <div>
                    <h2 className={styles.cardTitle}>Dossier en cours</h2>
                    <p className={styles.cardSubtitle}>
                      {product} pour {beneficiaryFirstName}
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.stepperWrap}>
                <Stepper steps={steps} currentStep={currentStep} />
              </div>

              <ProgressBar value={currentStep} max={totalSteps} />

              <div className={styles.dossierFooter}>
                <div className={styles.dossierMeta}>
                  <span className={styles.stepLabel}>
                    Étape {currentStep} sur {totalSteps}
                  </span>
                  <span className={styles.stepHint}>{stepHint}</span>
                </div>
                <Link to="/dossier" className={styles.continueLink}>
                  <Button>
                    Continuer
                    <ChevronRight />
                  </Button>
                </Link>
              </div>
            </Card>
          </section>

          <aside className={styles.sidebar} aria-label="Mon foyer">
            <Card className={styles.foyerCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleRow}>
                  <span className={styles.iconBlue} aria-hidden="true">
                    <FoyerIcon />
                  </span>
                  <h2 className={styles.cardTitle}>Mon foyer</h2>
                </div>
                <Link to="/foyer" className={styles.voirTout}>
                  Voir tout
                  <ChevronRight />
                </Link>
              </div>

              <ul className={styles.memberList}>
                {loading ? (
                  <li className={styles.memberLoading}>Chargement du foyer…</li>
                ) : (
                  members.map((member) => (
                  <li key={member.id} className={styles.memberRow}>
                    <Link to={`/foyer/${member.id}`} className={styles.memberLink}>
                      <Avatar
                        name={`${member.firstName} ${member.lastName}`}
                        size="sm"
                        character={member.character}
                        variant={member.avatarVariant ?? 'default'}
                      />
                      <div className={styles.memberInfo}>
                        <div className={styles.memberTop}>
                          <span className={styles.memberName}>
                            {member.firstName} {member.lastName}
                          </span>
                          {member.isSelf && (
                            <span className={styles.youBadge}>Vous</span>
                          )}
                        </div>
                        <div className={styles.memberTags}>
                          <span className={styles.tag}>{member.role}</span>
                          <span className={styles.tag}>{member.age} ans</span>
                        </div>
                        <span
                          className={[styles.status, statusClass(member.status)].join(' ')}
                        >
                          <span className={styles.statusDot} aria-hidden="true" />
                          {member.status}
                        </span>
                      </div>
                    </Link>
                  </li>
                  ))
                )}
              </ul>

              <p className={styles.foyerHint}>
                Gérez les personnes rattachées à votre compte et lancez une
                souscription pour chacune d&apos;elles.
              </p>
            </Card>
          </aside>
        </div>

        <div className={styles.mobileCta}>
          <Link to="/souscription/nouvelle" className={styles.ctaLink}>
            <Button fullWidth className={styles.ctaButton}>
              <PlusIcon />
              Nouvelle souscription
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
