import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AppLayout } from '../components/layout/AppLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import type { DataSource, PersonTitreView } from '../data/household-from-api'
import {
  getPersonDetailMocks,
  resolvePersonMockScenario,
} from '../data/person-detail-mock'
import type { ProductType } from '../domain/types/mobility'
import { usePersonDetail } from '../hooks/usePersonDetail'
import styles from './FichePersonnePage.module.css'

type TabId = 'resume' | 'titres' | 'documents' | 'historique'

const MOCK_SECTION_LABELS: Record<string, string> = {
  profile: 'profil',
  roles: 'rôles',
  titre: 'titre',
  ageBascule: 'alerte bascule',
}

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

function titreVisual(productType?: ProductType) {
  switch (productType) {
    case 'imagine_r_junior':
      return { brand: 'imagine', logo: 'R', type: 'Junior' }
    case 'imagine_r_scolaire':
      return { brand: 'imagine', logo: 'R', type: 'Scolaire' }
    case 'imagine_r_etudiant':
      return { brand: 'imagine', logo: 'R', type: 'Étudiant' }
    case 'navigo_annuel':
      return { brand: 'navigo', logo: '', type: 'Annuel' }
    case 'navigo_senior':
      return { brand: 'navigo', logo: '', type: 'Senior' }
    default:
      return { brand: 'imagine', logo: 'R', type: 'Junior' }
  }
}

function titreStatusClass(statusType: PersonTitreView['statusType']) {
  if (statusType === 'active') return styles.statusActive
  if (statusType === 'pending') return styles.statusPending
  return styles.statusNeutral
}

const TAB_MOCK_SECTIONS = ['titres', 'documents', 'historique'] as const

function DemoBanner({
  source,
  mockSections,
  error,
  activeTab,
}: {
  source: DataSource
  mockSections: string[]
  error: string | null
  activeTab: TabId
}) {
  const tabUsesMock = TAB_MOCK_SECTIONS.includes(activeTab as (typeof TAB_MOCK_SECTIONS)[number])

  if (source === 'mock') {
    return (
      <p className={styles.demoBanner} role="status">
        {error ?? 'Données de démonstration — fiche non branchée à l&apos;API mobilité.'}
      </p>
    )
  }

  if (!tabUsesMock && mockSections.length === 0) {
    return null
  }

  if (tabUsesMock) {
    return (
      <p className={styles.demoBannerPartial} role="status">
        Données API pour le profil — onglets Titres, Documents et Historique en démonstration.
      </p>
    )
  }

  if (mockSections.length === 0) {
    return null
  }

  const labels = mockSections.map((section) => MOCK_SECTION_LABELS[section] ?? section)
  return (
    <p className={styles.demoBannerPartial} role="status">
      Données API — blocs en démonstration : {labels.join(', ')}.
    </p>
  )
}

function documentStatusClass(status: string) {
  if (status === 'accepted') return styles.docAccepted
  if (status === 'pending') return styles.docPending
  if (status === 'refused') return styles.docRefused
  return styles.docMissing
}

export function FichePersonnePage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation('foyer')
  const [activeTab, setActiveTab] = useState<TabId>('resume')
  const { person, source, mockSections, loading, error } = usePersonDetail(id)

  const TABS: { id: TabId; label: string }[] = [
    { id: 'resume', label: t('fiche.tabs.resume') },
    { id: 'titres', label: t('fiche.tabs.titres') },
    { id: 'documents', label: t('fiche.tabs.documents') },
    { id: 'historique', label: t('fiche.tabs.historique') },
  ]

  const mockScenario = useMemo(
    () => resolvePersonMockScenario({ firstName: person.firstName, age: person.age }),
    [person.firstName, person.age],
  )

  const tabMocks = useMemo(() => getPersonDetailMocks(mockScenario), [mockScenario])
  const titreVisualParts = titreVisual(person.titre?.productType)

  return (
    <AppLayout activeTab="foyer">
      <div className={styles.page}>
        <PageHeader title={t('fiche.title')} backTo="/foyer" />

        <DemoBanner
          source={source}
          mockSections={mockSections}
          error={error}
          activeTab={activeTab}
        />

        {loading ? (
          <p className={styles.loadingHint}>Chargement de la fiche…</p>
        ) : (
          <>
            <div className={styles.profileHeader}>
              <Avatar
                name={`${person.firstName} ${person.lastName}`}
                size="lg"
                character={person.character}
                variant={person.age < 18 ? 'child' : 'default'}
              />
              <div className={styles.profileInfo}>
                <h1 className={styles.profileName}>
                  {person.firstName} {person.lastName}
                </h1>
                <p className={styles.profileAge}>{t('ageYears', { count: person.age })}</p>
              </div>
              <span className={styles.profileBadge}>{person.profile}</span>
            </div>

            <nav className={styles.tabs} aria-label={t('fiche.tabsAria')}>
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
                    <h2 className={styles.cardTitle}>{t('fiche.roles')}</h2>
                    <ul className={styles.roleList}>
                      <li className={styles.roleRow}>
                        <span className={styles.roleIcon} aria-hidden="true"><PersonIcon /></span>
                        <div className={styles.roleBody}>
                          <span className={styles.roleLabel}>{t('fiche.holder')}</span>
                          <span className={styles.roleValue}>{person.roles.porteurLabel}</span>
                        </div>
                        <span className={styles.roleChevron} aria-hidden="true"><ChevronRight /></span>
                      </li>
                      <li className={styles.roleRow}>
                        <span className={styles.roleIcon} aria-hidden="true"><CardIcon /></span>
                        <div className={styles.roleBody}>
                          <span className={styles.roleLabel}>{t('fiche.payer')}</span>
                          <span className={styles.roleValue}>
                            {person.roles.payeur.name}
                            {person.roles.payeur.isSelf && (
                              <span className={styles.youBadge}>{t('fiche.youLower')}</span>
                            )}
                          </span>
                        </div>
                        <span className={styles.roleChevron} aria-hidden="true"><ChevronRight /></span>
                      </li>
                      <li className={styles.roleRow}>
                        <span className={styles.roleIcon} aria-hidden="true"><ShieldIcon /></span>
                        <div className={styles.roleBody}>
                          <span className={styles.roleLabel}>{t('fiche.legalGuardian')}</span>
                          <span className={styles.roleValue}>
                            {person.roles.responsableLegal.name}
                          </span>
                        </div>
                        <span className={styles.roleChevron} aria-hidden="true"><ChevronRight /></span>
                      </li>
                    </ul>
                  </Card>

                  {person.ageBascule && (
                    <div className={styles.alertBanner}>
                      <span className={styles.alertIcon} aria-hidden="true"><AlertIcon /></span>
                      <span className={styles.alertText}>{person.ageBascule}</span>
                    </div>
                  )}
                </div>

                <div className={styles.resumeRight}>
                  {person.titre ? (
                    <Card className={styles.titreCard}>
                      <div className={styles.titreHeader}>
                        <div className={styles.titreVisual} aria-hidden="true">
                          <span className={styles.titreBrand}>{titreVisualParts.brand}</span>
                          {titreVisualParts.logo && (
                            <span className={styles.titreLogo}>{titreVisualParts.logo}</span>
                          )}
                          <span className={styles.titreType}>{titreVisualParts.type}</span>
                        </div>
                        <div className={styles.titreInfo}>
                          <p className={styles.titreName}>{person.titre.label}</p>
                          <p className={styles.titreValidity}>{person.titre.validity}</p>
                          <span
                            className={[
                              styles.titreStatus,
                              titreStatusClass(person.titre.statusType),
                            ].join(' ')}
                          >
                            <span className={styles.statusDot} aria-hidden="true" />
                            {person.titre.status}
                          </span>
                        </div>
                      </div>
                      <ChevronRight />
                    </Card>
                  ) : (
                    <Card className={styles.titreCardEmpty}>
                      <p>Aucun titre rattaché pour le moment.</p>
                    </Card>
                  )}

                  <Link to="/souscription/nouvelle">
                    <Button fullWidth className={styles.ctaBtn}>
                      <span aria-hidden="true"><PlusIcon /></span>
                      {t('fiche.subscribe')}
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'titres' && (
              <ul className={styles.tabList}>
                {tabMocks.titres.map((titre) => {
                  const visual = titreVisual(titre.productType)
                  return (
                    <li key={titre.id}>
                      <Card className={styles.titreCard}>
                        <div className={styles.titreHeader}>
                          <div className={styles.titreVisual} aria-hidden="true">
                            <span className={styles.titreBrand}>{visual.brand}</span>
                            {visual.logo && (
                              <span className={styles.titreLogo}>{visual.logo}</span>
                            )}
                            <span className={styles.titreType}>{visual.type}</span>
                          </div>
                          <div className={styles.titreInfo}>
                            <p className={styles.titreName}>{titre.label}</p>
                            <p className={styles.titreValidity}>
                              {titre.period ?? titre.validity}
                            </p>
                            <span
                              className={[
                                styles.titreStatus,
                                titreStatusClass(titre.statusType),
                              ].join(' ')}
                            >
                              <span className={styles.statusDot} aria-hidden="true" />
                              {titre.status}
                            </span>
                          </div>
                        </div>
                        <ChevronRight />
                      </Card>
                    </li>
                  )
                })}
              </ul>
            )}

            {activeTab === 'documents' && (
              <ul className={styles.tabList}>
                {tabMocks.documents.map((doc) => (
                  <li key={doc.id}>
                    <Card className={styles.docCard}>
                      <div className={styles.docBody}>
                        <p className={styles.docLabel}>{doc.label}</p>
                        {doc.uploadedAt && (
                          <p className={styles.docMeta}>Déposé le {doc.uploadedAt}</p>
                        )}
                      </div>
                      <span
                        className={[
                          styles.docStatus,
                          documentStatusClass(doc.status),
                        ].join(' ')}
                      >
                        {doc.statusLabel}
                      </span>
                    </Card>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'historique' && (
              <ol className={styles.historyList}>
                {tabMocks.historique.map((event) => (
                  <li
                    key={event.id}
                    className={[
                      styles.historyItem,
                      event.done ? styles.historyDone : '',
                      event.active ? styles.historyActive : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <span className={styles.historyDot} aria-hidden="true" />
                    <div className={styles.historyBody}>
                      <p className={styles.historyLabel}>{event.label}</p>
                      <p className={styles.historyDate}>{event.date}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}
