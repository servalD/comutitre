import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { mobilityApi } from '../../api/mobility-api'
import { ApiError } from '../../api/http-client'
import { useLabels } from '../../constants/labels'
import type {
  Contract,
  Document,
  MobilityIdentity,
  Relationship,
  Support,
  TimelineEvent,
} from '../../domain/types/mobility'
import { ContractList } from '../../components/mobility/ContractList'
import { DocumentList } from '../../components/mobility/DocumentList'
import { SupportList } from '../../components/mobility/SupportList'
import { TimelineList } from '../../components/mobility/TimelineList'
import { RelationshipList } from '../../components/mobility/RelationshipList'
import { CreateDocumentForm } from '../../components/mobility/forms/CreateDocumentForm'
import { CreateSupportForm } from '../../components/mobility/forms/CreateSupportForm'
import { CreateRelationshipForm } from '../../components/mobility/forms/CreateRelationshipForm'
import { EditIdentityForm } from '../../components/mobility/forms/EditIdentityForm'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Tabs, type TabItem } from '../../components/ui/Tabs'
import styles from './MobilityPages.module.css'

type DetailTab = 'resume' | 'contracts' | 'documents' | 'supports' | 'timeline' | 'access'

export function IdentityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('mobility')
  const { identityStatusLabels, profileLabels } = useLabels()
  const tabs: TabItem<DetailTab>[] = [
    { id: 'resume', label: t('detail.tabs.resume'), icon: '👤' },
    { id: 'contracts', label: t('detail.tabs.contracts'), icon: '🎫' },
    { id: 'documents', label: t('detail.tabs.documents'), icon: '📄' },
    { id: 'supports', label: t('detail.tabs.supports'), icon: '💳' },
    { id: 'timeline', label: t('detail.tabs.timeline'), icon: '🕐' },
    { id: 'access', label: t('detail.tabs.access'), icon: '🔗' },
  ]
  const [activeTab, setActiveTab] = useState<DetailTab>('resume')
  const [identity, setIdentity] = useState<MobilityIdentity | null>(null)
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [supports, setSupports] = useState<Support[]>([])
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!id) return

    const identityId = id
    let cancelled = false

    async function fetchData() {
      try {
        const [
          identityData,
          myIdentities,
          contractsData,
          documentsData,
          supportsData,
          timelineData,
        ] = await Promise.all([
          mobilityApi.getIdentity(identityId),
          mobilityApi.listMyIdentities(),
          mobilityApi.listContracts(identityId),
          mobilityApi.listDocuments(identityId),
          mobilityApi.listSupports(identityId),
          mobilityApi.getTimeline(identityId),
        ])

        if (cancelled) return

        const linked = myIdentities.find((item) => item.id === identityId)
        setIdentity(identityData)
        setRelationships(linked?.relationships ?? [])
        setContracts(contractsData)
        setDocuments(documentsData)
        setSupports(supportsData)
        setTimeline(timelineData)
        setError(null)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : t('subscribe.loadError'))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void fetchData()

    return () => {
      cancelled = true
    }
  }, [id, reloadKey, t])

  function refresh() {
    setReloadKey((key) => key + 1)
  }

  async function handleRevoke(relationshipId: string) {
    setRevokingId(relationshipId)
    try {
      await mobilityApi.revokeRelationship(relationshipId)
      refresh()
    } finally {
      setRevokingId(null)
    }
  }

  if (!id) {
    return <p className={styles.status}>{t('subscribe.notFound')}</p>
  }

  if (loading) {
    return <p className={styles.loading}>{t('common:loading')}</p>
  }

  if (error || !identity) {
    return <p className={styles.status}>{error ?? t('subscribe.notFound')}</p>
  }

  const activeRelationships = relationships.filter((rel) => rel.status === 'active')

  return (
    <div className={styles.page}>
      <Link to="/mobility" className={styles.back}>
        <span aria-hidden="true">←</span> {t('detail.backToList')}
      </Link>

      <header className={styles.header}>
        <div className={styles.summary}>
          <div className={styles.avatar} aria-hidden="true">
            {identity.calculatedAge < 18 ? '👦' : '👤'}
          </div>
          <div className={styles.summaryMeta}>
            <h1>
              {identity.firstName} {identity.lastName}
            </h1>
            <p>
              {profileLabels[identity.currentProfile]} ·{' '}
              {t('identity.ageYears', { count: identity.calculatedAge })} ·{' '}
              {t('detail.bornOn', {
                date: new Date(identity.birthDate).toLocaleDateString(i18n.language),
              })}
            </p>
            <Badge tone={identity.status === 'active' ? 'success' : 'warning'}>
              {identityStatusLabels[identity.status]}
            </Badge>
          </div>
        </div>
      </header>

      <Tabs items={tabs} active={activeTab} onChange={setActiveTab} />

      <section className={styles.panel} role="tabpanel">
        {activeTab === 'resume' ? (
          <Card className={styles.section}>
            <EditIdentityForm
              identity={identity}
              onSubmit={async (payload) => {
                const updated = await mobilityApi.updateIdentity(id, payload)
                setIdentity(updated)
                refresh()
              }}
            />
          </Card>
        ) : null}

        {activeTab === 'contracts' ? (
          <div className={styles.section}>
            <Button onClick={() => navigate(`/mobility/${id}/subscribe`)}>
              <span aria-hidden="true">🎫</span> {t('subscribe.title')}
            </Button>
            {contracts.length === 0 ? (
              <EmptyState
                icon="🎫"
                title={t('detail.noContracts')}
                description={t('detail.noContractsDesc')}
              />
            ) : (
              <ContractList contracts={contracts} />
            )}
          </div>
        ) : null}

        {activeTab === 'documents' ? (
          <div className={styles.section}>
            <CreateDocumentForm
              onSubmit={async (payload) => {
                await mobilityApi.createDocument(id, payload)
                refresh()
              }}
            />
            {documents.length === 0 ? (
              <EmptyState icon="📄" title={t('detail.noDocuments')} />
            ) : (
              <DocumentList documents={documents} />
            )}
          </div>
        ) : null}

        {activeTab === 'supports' ? (
          <div className={styles.section}>
            <CreateSupportForm
              onSubmit={async (payload) => {
                await mobilityApi.createSupport(id, payload)
                refresh()
              }}
            />
            {supports.length === 0 ? (
              <EmptyState icon="💳" title={t('detail.noSupports')} />
            ) : (
              <SupportList supports={supports} />
            )}
          </div>
        ) : null}

        {activeTab === 'timeline' ? (
          <div className={styles.section}>
            {timeline.length === 0 ? (
              <EmptyState icon="🕐" title={t('detail.noTimeline')} />
            ) : (
              <TimelineList events={timeline} />
            )}
          </div>
        ) : null}

        {activeTab === 'access' ? (
          <div className={styles.section}>
            <CreateRelationshipForm
              identityId={id}
              existingTypes={activeRelationships.map((rel) => rel.relationshipType)}
              onSubmit={async (payload) => {
                await mobilityApi.createRelationship(payload)
                refresh()
              }}
            />
            {relationships.length === 0 ? (
              <EmptyState icon="🔗" title={t('detail.noAccess')} />
            ) : (
              <RelationshipList
                relationships={relationships}
                onRevoke={handleRevoke}
                revokingId={revokingId}
              />
            )}
          </div>
        ) : null}
      </section>
    </div>
  )
}
