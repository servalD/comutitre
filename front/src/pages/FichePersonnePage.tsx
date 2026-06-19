import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { MOCK_PERSON_LEA } from '../data/mock'
import styles from './FichePersonnePage.module.css'

type TabId = 'resume' | 'titres' | 'documents' | 'historique'

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'resume', label: 'Résumé' },
  { id: 'titres', label: 'Titres' },
  { id: 'documents', label: 'Documents' },
  { id: 'historique', label: 'Historique' },
]

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TicketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function FichePersonnePage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<TabId>('resume')

  const person = id === '2' ? MOCK_PERSON_LEA : MOCK_PERSON_LEA

  return (
    <AppLayout activeTab="foyer">
      <div className={styles.page}>
        <PageHeader title="Fiche personne" backTo="/foyer" />

        <div className={styles.profileHeader}>
          <Avatar
            name={`${person.firstName} ${person.lastName}`}
            size="lg"
            character={person.character}
          />
          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>{person.firstName} {person.lastName}</h1>
            <p className={styles.profileAge}>{person.age} ans</p>
          </div>
          <span className={styles.profileBadge}>{person.profile}</span>
        </div>

        <nav className={styles.tabs} aria-label="Onglets fiche personne">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={[styles.tab, activeTab === tab.id ? styles.tabActive : ''].filter(Boolean).join(' ')}
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === 'resume' && (
          <div className={styles.resumeGrid}>
            <div className={styles.resumeLeft}>
              <Card className={styles.rolesCard}>
                <h2 className={styles.cardTitle}>Rôles</h2>
                <ul className={styles.roleList}>
                  <li className={styles.roleRow}>
                    <span className={styles.roleIcon} aria-hidden="true"><PersonIcon /></span>
                    <div className={styles.roleBody}>
                      <span className={styles.roleLabel}>Porteur</span>
                      <span className={styles.roleValue}>{person.roles.porteur.label}</span>
                    </div>
                    <span className={styles.roleChevron} aria-hidden="true"><ChevronRight /></span>
                  </li>
                  <li className={styles.roleRow}>
                    <span className={styles.roleIcon} aria-hidden="true"><CardIcon /></span>
                    <div className={styles.roleBody}>
                      <span className={styles.roleLabel}>Payeur</span>
                      <span className={styles.roleValue}>
                        {person.roles.payeur.name}
                        {person.roles.payeur.isSelf && <span className={styles.youBadge}>vous</span>}
                      </span>
                    </div>
                    <span className={styles.roleChevron} aria-hidden="true"><ChevronRight /></span>
                  </li>
                  <li className={styles.roleRow}>
                    <span className={styles.roleIcon} aria-hidden="true"><ShieldIcon /></span>
                    <div className={styles.roleBody}>
                      <span className={styles.roleLabel}>Responsable légal</span>
                      <span className={styles.roleValue}>{person.roles.responsableLegal.name}</span>
                    </div>
                    <span className={styles.roleChevron} aria-hidden="true"><ChevronRight /></span>
                  </li>
                </ul>
              </Card>

              <div className={styles.alertBanner}>
                <span className={styles.alertIcon} aria-hidden="true"><AlertIcon /></span>
                <span className={styles.alertText}>{person.ageBascule}</span>
              </div>
            </div>

            <div className={styles.resumeRight}>
              <Card className={styles.titreCard}>
                <div className={styles.titreHeader}>
                  <div className={styles.titreVisual} aria-hidden="true">
                    <span className={styles.titreBrand}>imagine</span>
                    <span className={styles.titreLogo}>R</span>
                    <span className={styles.titreType}>Junior</span>
                  </div>
                  <div className={styles.titreInfo}>
                    <p className={styles.titreName}>{person.titre.label}</p>
                    <p className={styles.titreValidity}>{person.titre.validity}</p>
                    <span className={[styles.titreStatus, styles.statusPending].join(' ')}>
                      <span className={styles.statusDot} aria-hidden="true" />
                      {person.titre.status}
                    </span>
                  </div>
                </div>
                <ChevronRight />
              </Card>

              <Link to="/souscription/nouvelle">
                <Button fullWidth className={styles.ctaBtn}>
                  <span aria-hidden="true"><PlusIcon /></span>
                  Souscrire un titre
                </Button>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'titres' && (
          <div className={styles.placeholder}>
            <TicketIcon />
            <p>Les titres actifs et archives apparaîtront ici.</p>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className={styles.placeholder}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" /><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" /></svg>
            <p>Les documents déposés apparaîtront ici.</p>
          </div>
        )}

        {activeTab === 'historique' && (
          <div className={styles.placeholder}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            <p>L'historique des événements apparaîtra ici.</p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
