import { Link } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useHouseholdData } from '../hooks/useHouseholdData'
import styles from './MonFoyerPage.module.css'

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

const ADD_PERSON_PATH = '/mobility/new'

export function MonFoyerPage() {
  const { members, loading, error } = useHouseholdData()

  return (
    <AppLayout activeTab="foyer">
      <div className={styles.page}>
        <PageHeader
          title="Mon foyer"
          backTo="/"
          subtitle="Gérez les personnes de votre compte"
        />

        {error && (
          <p className={styles.loadError} role="status">
            {error} Affichage de démonstration.
          </p>
        )}

        <div className={styles.toolbar}>
          <p className={styles.count}>
            <strong>{loading ? '…' : members.length}</strong> personnes rattachées
          </p>
          <Link to={ADD_PERSON_PATH} state={{ from: '/foyer' }} className={styles.toolbarLink}>
            <Button className={styles.toolbarBtn}>
              <PlusIcon />
              Ajouter une personne
            </Button>
          </Link>
        </div>

        <ul className={styles.memberGrid} aria-label="Membres du foyer">
          {loading ? (
            <li className={styles.memberLoading}>Chargement du foyer…</li>
          ) : (
            members.map((member) => (
            <li key={member.id}>
              <Card className={styles.memberCard}>
                <Link to={`/foyer/${member.id}`} className={styles.memberBtn}>
                  <Avatar
                    name={`${member.firstName} ${member.lastName}`}
                    size="md"
                    character={member.character}
                    variant={member.avatarVariant ?? 'default'}
                  />

                  <div className={styles.memberBody}>
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

                  <ChevronRight />
                </Link>
              </Card>
            </li>
            ))
          )}
        </ul>

        <div className={styles.addSection}>
          <Link to={ADD_PERSON_PATH} state={{ from: '/foyer' }} className={styles.addDashed}>
            <span className={styles.addIcon} aria-hidden="true">
              <PlusIcon />
            </span>
            <span className={styles.addLabel}>Ajouter une personne</span>
            <span className={styles.addHint}>
              Enfant, conjoint ou personne à charge
            </span>
          </Link>

          <Link to={ADD_PERSON_PATH} state={{ from: '/foyer' }} className={styles.mobileAddLink}>
            <Button fullWidth className={styles.mobileAddBtn}>
              <PlusIcon />
              Ajouter une personne
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
