import { Link } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
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

const ADD_PERSON_PATH = '/foyer/ajouter'

export function MonFoyerPage() {
  const { t } = useTranslation('foyer')
  const { members, loading, error } = useHouseholdData()

  return (
    <AppLayout activeTab="foyer">
      <div className={styles.page}>
        <PageHeader
          title={t('common:tabs.foyer')}
          backTo="/"
          subtitle={t('foyer.subtitle')}
        />

        {error && (
          <p className={styles.loadError} role="status">
            {error} {t('espace.demoFallback')}
          </p>
        )}

        <div className={styles.toolbar}>
          <p className={styles.count}>
            <Trans
              i18nKey="foyer.count"
              ns="foyer"
              values={{ count: loading ? '…' : members.length }}
              components={{ strong: <strong /> }}
            />
          </p>
          <Link to={ADD_PERSON_PATH} state={{ from: '/foyer' }} className={styles.toolbarLink}>
            <Button className={styles.toolbarBtn}>
              <PlusIcon />
              {t('foyer.addPerson')}
            </Button>
          </Link>
        </div>

        <ul className={styles.memberGrid} aria-label={t('foyer.membersAria')}>
          {loading ? (
            <li className={styles.memberLoading}>{t('espace.loadingHousehold')}</li>
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
                        <span className={styles.youBadge}>{t('espace.you')}</span>
                      )}
                    </div>

                    <div className={styles.memberTags}>
                      <span className={styles.tag}>{member.role}</span>
                      <span className={styles.tag}>{t('ageYears', { count: member.age })}</span>
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
            <span className={styles.addLabel}>{t('foyer.addPerson')}</span>
            <span className={styles.addHint}>{t('foyer.addHint')}</span>
          </Link>

          <Link to={ADD_PERSON_PATH} state={{ from: '/foyer' }} className={styles.mobileAddLink}>
            <Button fullWidth className={styles.mobileAddBtn}>
              <PlusIcon />
              {t('foyer.addPerson')}
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
