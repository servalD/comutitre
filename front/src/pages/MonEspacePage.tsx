import { Link } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import {
  SubscriptionDossierActionAlert,
  SubscriptionDossierEmptyCard,
  SubscriptionDossierFeaturedCard,
} from '../components/subscription/SubscriptionDossierCards'
import { useHouseholdData } from '../hooks/useHouseholdData'
import styles from './MonEspacePage.module.css'

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
    dossiers,
    latestDossier,
    dossierSource,
    loading,
    error,
  } = useHouseholdData()

  const recoveryAlerts = members.filter(
    (m) => !m.isSelf && m.identityStatus === 'pending_recovery',
  )

  const needsJustificatifs = dossiers.some(
    (d) =>
      d.status === 'en_attente_de_justificatif' &&
      d.documentsDeposed < d.documentsRequired,
  )
  const needsSignature = dossiers.some(
    (d) =>
      d.status === 'en_attente_de_signature_payeur' ||
      d.status === 'signature_en_cours',
  )

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

        {recoveryAlerts.length > 0 && (
          <section className={styles.recoveryAlerts} aria-label="Passation de compte">
            {recoveryAlerts.map((member) => (
              <Card key={member.id} className={styles.recoveryCard}>
                <div className={styles.recoveryCardContent}>
                  <p className={styles.recoveryCardTitle}>
                    {member.firstName} a initié une récupération de compte
                  </p>
                  <p className={styles.recoveryCardText}>
                    Votre enfant demande à gérer son propre espace client. La
                    récupération est en cours de validation par code e-mail.
                  </p>
                  <Link to={`/foyer/${member.id}`} className={styles.recoveryCardLink}>
                    Voir la fiche de {member.firstName}
                    <ChevronRight />
                  </Link>
                </div>
              </Card>
            ))}
          </section>
        )}

        <div className={styles.grid}>
          <section className={styles.primary} aria-label="Dossier en cours">
            {dossiers.length > 0 && (
              <SubscriptionDossierActionAlert
                needsJustificatifs={needsJustificatifs}
                needsSignature={needsSignature}
              />
            )}

            {loading ? (
              <Card className={styles.dossierCard}>
                <p className={styles.dossierLoading}>Chargement du dossier…</p>
              </Card>
            ) : latestDossier ? (
              <SubscriptionDossierFeaturedCard
                dossier={latestDossier}
                totalPending={dossiers.length}
                showSyncNote={dossierSource === 'api'}
              />
            ) : (
              <SubscriptionDossierEmptyCard title="Dossier en cours" />
            )}
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
