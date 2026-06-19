import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { contractsApi, type ContractResponse } from '../api/contracts'
import {
  clientStatusHint,
  justificatifsApi,
  type JustificatifResponse,
} from '../api/justificatifs'
import { AppLayout } from '../components/layout/AppLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DocumentRow } from '../components/ui/DocumentRow'
import { InfoBanner } from '../components/ui/InfoBanner'
import { Stepper } from '../components/ui/Stepper'
import { UploadZone } from '../components/ui/UploadZone'
import { useAuth } from '../contexts/AuthContext'
import {
  SubscriptionDossierActionAlert,
  SubscriptionDossierCompactCard,
} from '../components/subscription/SubscriptionDossierCards'
import {
  allRequiredDocumentsReady,
  buildRequiredDocumentSlots,
  countReadySlots,
  firstSelectableSlotType,
} from '../domain/justificatif-slots'
import {
  buildSubscriptionDossierView,
  dossierDetailPath,
  findPendingSubscriptionContracts,
  formatDossierDate,
  sortSubscriptionDossiersForSelection,
  subscriptionContractStatusLabels,
  type SubscriptionDossierView,
} from '../domain/subscription-dossier'
import styles from './MonDossierPage.module.css'

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

export function MonDossierPage() {
  const navigate = useNavigate()
  const { t } = useTranslation('dossier')
  const { token } = useAuth()
  const [searchParams] = useSearchParams()
  const contractId = searchParams.get('contractId') ?? ''

  const fileRef = useRef<HTMLInputElement>(null)
  const [contract, setContract] = useState<ContractResponse | null>(null)
  const [uploads, setUploads] = useState<JustificatifResponse[]>([])
  const [loading, setLoading] = useState(!!contractId)
  const [listChecked, setListChecked] = useState(!!contractId)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [accordionOpen, setAccordionOpen] = useState(true)
  const [pendingDossiers, setPendingDossiers] = useState<SubscriptionDossierView[]>([])

  useEffect(() => {
    if (!token || contractId) return

    let cancelled = false
    contractsApi
      .list(token)
      .then(async (contracts) => {
        if (cancelled) return
        const pendingContracts = findPendingSubscriptionContracts(contracts)
        if (pendingContracts.length === 1) {
          const view = buildSubscriptionDossierView(pendingContracts[0]!, [])
          navigate(dossierDetailPath(view), { replace: true })
          return
        }

        if (pendingContracts.length > 1) {
          const built = await Promise.all(
            pendingContracts.map(async (contract) => {
              const uploads = await justificatifsApi
                .list(token, contract.id)
                .catch(() => [])
              return buildSubscriptionDossierView(contract, uploads)
            }),
          )
          if (!cancelled) {
            setPendingDossiers(sortSubscriptionDossiersForSelection(built))
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setListChecked(true)
      })

    return () => {
      cancelled = true
    }
  }, [token, contractId, navigate])

  useEffect(() => {
    if (!token || !contractId) return

    let cancelled = false

    Promise.all([
      contractsApi.get(token, contractId),
      justificatifsApi.list(token, contractId),
    ])
      .then(([contractData, justificatifs]) => {
        if (cancelled) return
        if (contractData.status === 'en_attente_paiement') {
          navigate(`/dossier/paiement?contractId=${contractId}`, { replace: true })
          return
        }
        if (
          contractData.status === 'actif' ||
          contractData.status === 'en_attente_de_validation_documentaire'
        ) {
          navigate(`/dossier/validation?contractId=${contractId}`, { replace: true })
          return
        }
        if (
          contractData.status === 'en_attente_de_signature_payeur' ||
          contractData.status === 'signature_en_cours'
        ) {
          navigate(`/dossier/signature?contractId=${contractId}`, { replace: true })
          return
        }
        setContract(contractData)
        setUploads(justificatifs)
        setLoadError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setLoadError(
          err instanceof Error ? err.message : 'Impossible de charger le dossier.',
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token, contractId, navigate])

  const hasPendingVerification = uploads.some(
    (j) => j.status === 'en_cours_de_verification',
  )

  useEffect(() => {
    if (!token || !contractId || !hasPendingVerification) return
    const interval = setInterval(() => {
      Promise.all([
        justificatifsApi.list(token, contractId),
        contractsApi.get(token, contractId),
      ])
        .then(([uploads, updatedContract]) => {
          setUploads(uploads)
          setContract(updatedContract)
        })
        .catch(() => {})
    }, 3000)
    return () => clearInterval(interval)
  }, [token, contractId, hasPendingVerification])

  const documentSlots =
    contract && !loading && contractId
      ? buildRequiredDocumentSlots(contract.productCode, uploads)
      : []
  const activeSelectedType = (() => {
    const current = documentSlots.find(
      (slot) => slot.justificatifType === selectedType,
    )
    if (current?.canSelect) return selectedType
    return firstSelectableSlotType(documentSlots) ?? ''
  })()
  const selectedSlot = documentSlots.find(
    (slot) => slot.justificatifType === activeSelectedType,
  )
  const documentsReady = allRequiredDocumentsReady(documentSlots)
  const readyCount = countReadySlots(documentSlots)
  const totalRequired = documentSlots.length

  async function handleUpload() {
    if (!token || !contractId || !selectedFile || !activeSelectedType) return
    setUploading(true)
    setUploadError(null)
    setUploadSuccess(null)
    try {
      const result = await justificatifsApi.upload(token, {
        contractId,
        type: activeSelectedType,
        file: selectedFile,
        firstName: contract?.holderFirstName,
        lastName: contract?.holderLastName,
      })
      const refreshed = await justificatifsApi.list(token, contractId)
      setUploads(refreshed)
      const updatedContract = await contractsApi.get(token, contractId)
      setContract(updatedContract)
      const slots = buildRequiredDocumentSlots(contract!.productCode, refreshed)
      const nextType = firstSelectableSlotType(slots)
      if (nextType) setSelectedType(nextType)
      setSelectedFile(null)
      if (fileRef.current) fileRef.current.value = ''
      setUploadSuccess(`${result.originalFilename} déposé avec succès.`)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Échec du dépôt.')
    } finally {
      setUploading(false)
    }
  }

  if (!contractId) {
    if (!listChecked) {
      return (
        <AppLayout activeTab="accueil">
          <div className={styles.page}>
            <PageHeader title={t('detail.title')} backTo="/espace" />
            <p>Chargement du dossier…</p>
          </div>
        </AppLayout>
      )
    }

    if (pendingDossiers.length > 1) {
      const needsJustificatifs = pendingDossiers.some(
        (d) =>
          d.status === 'en_attente_de_justificatif' &&
          d.documentsDeposed < d.documentsRequired,
      )
      const needsSignature = pendingDossiers.some(
        (d) =>
          d.status === 'en_attente_de_signature_payeur' ||
          d.status === 'signature_en_cours',
      )

      return (
        <AppLayout activeTab="accueil">
          <div className={styles.page}>
            <PageHeader
              title={`Mes dossiers en cours (${pendingDossiers.length})`}
              backTo="/espace"
            />
            <p className={styles.hubIntro}>
              Choisissez le dossier à compléter pour chaque personne de votre
              foyer.
            </p>
            <SubscriptionDossierActionAlert
              needsJustificatifs={needsJustificatifs}
              needsSignature={needsSignature}
            />
            <ul className={styles.dossierList}>
              {pendingDossiers.map((dossier) => (
                <li key={dossier.contractId}>
                  <SubscriptionDossierCompactCard dossier={dossier} />
                </li>
              ))}
            </ul>
            <Link to="/souscription/nouvelle" className={styles.newSubscriptionLink}>
              <Button>Nouvelle souscription</Button>
            </Link>
          </div>
        </AppLayout>
      )
    }

    return (
      <AppLayout activeTab="accueil">
        <div className={styles.page}>
          <PageHeader title={t('detail.title')} backTo="/espace" />
          <Card>
            <p>Aucun dossier en cours. Lancez une souscription pour commencer.</p>
            <Link to="/souscription/nouvelle">
              <Button>Nouvelle souscription</Button>
            </Link>
          </Card>
        </div>
      </AppLayout>
    )
  }

  const dossierView =
    contract && !loading
      ? buildSubscriptionDossierView(contract, uploads)
      : null

  const beneficiaryFullName = dossierView?.beneficiaryFullName ?? '…'
  const productName = dossierView?.product ?? '…'

  return (
    <AppLayout activeTab="accueil">
      <div className={styles.page}>
        <PageHeader title={t('detail.title')} backTo="/espace" />

        {loadError && (
          <p className={styles.loadError} role="alert">
            {loadError}
          </p>
        )}

        {loading ? (
          <p>Chargement du dossier…</p>
        ) : (
          <>
            <section className={styles.summary} aria-label={t('detail.summaryAria')}>
              <div className={styles.cardVisual} aria-hidden="true">
                <div className={styles.cardChip} />
                <span className={styles.cardBrand}>navigo</span>
                <span className={styles.cardType}>pass</span>
              </div>
              <div className={styles.summaryInfo}>
                <h2 className={styles.productName}>{productName}</h2>
                <p className={styles.beneficiary}>{beneficiaryFullName}</p>
                {contract?.status ? (
                  <p className={styles.contractStatus}>
                    {subscriptionContractStatusLabels[contract.status] ??
                      contract.status}
                  </p>
                ) : null}
              </div>
            </section>

            {dossierView && (
              <Card className={styles.registeredCard} aria-label="Informations enregistrées">
                <h3 className={styles.registeredTitle}>Informations enregistrées</h3>
                <dl className={styles.registeredGrid}>
                  <div>
                    <dt>Forfait</dt>
                    <dd>{dossierView.product}</dd>
                  </div>
                  <div>
                    <dt>Bénéficiaire</dt>
                    <dd>{dossierView.beneficiaryFullName}</dd>
                  </div>
                  <div>
                    <dt>E-mail bénéficiaire</dt>
                    <dd>{dossierView.holderEmail}</dd>
                  </div>
                  <div>
                    <dt>Payeur</dt>
                    <dd>{dossierView.payerFullName}</dd>
                  </div>
                  {contract?.legalRepEmail ? (
                    <div>
                      <dt>Responsable légal</dt>
                      <dd>{contract.legalRepEmail}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>Créé le</dt>
                    <dd>{formatDossierDate(dossierView.createdAt)}</dd>
                  </div>
                  <div>
                    <dt>Référence dossier</dt>
                    <dd className={styles.contractRef}>{dossierView.contractId}</dd>
                  </div>
                </dl>
              </Card>
            )}

            <div className={styles.stepperSection}>
              <Stepper
                steps={dossierView?.steps ?? []}
                currentStep={dossierView?.currentStep ?? 1}
              />
            </div>

            <div className={styles.content}>
              <section className={styles.documentsPanel} aria-label={t('detail.documents')}>
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
                      <span className={styles.accordionTitle}>{t('detail.documents')}</span>
                    </span>
                    <ChevronIcon open={accordionOpen} />
                  </button>

                  {accordionOpen && (
                    <div className={styles.accordionBody}>
                      <p className={styles.instruction}>
                        {t('detail.instruction')}
                      </p>
                      <div className={styles.documentList}>
                        {documentSlots.map((slot) => (
                          <DocumentRow
                            key={slot.justificatifType}
                            icon={<DocIcon />}
                            label={slot.label}
                            status={slot.documentStatus}
                            statusLabel={slot.statusLabel}
                            selected={slot.justificatifType === activeSelectedType}
                            onClick={
                              slot.canSelect
                                ? () => setSelectedType(slot.justificatifType)
                                : undefined
                            }
                          />
                        ))}
                      </div>
                      {uploads.map((j) => {
                        const hint = clientStatusHint(j)
                        return hint ? (
                          <p key={`hint-${j.id}`} className={styles.uploadHint}>
                            {j.originalFilename} — {hint}
                          </p>
                        ) : null
                      })}
                    </div>
                  )}
                </Card>
              </section>

              <aside className={styles.actionsPanel} aria-label={t('detail.uploadAria')}>
                {selectedSlot ? (
                  <>
                    <p className={styles.uploadContext}>
                      Document sélectionné : <strong>{selectedSlot.label}</strong>
                    </p>
                    <label className={styles.uploadTypeLabel} htmlFor="doc-type">
                      Type de document
                    </label>
                    <select
                      id="doc-type"
                      className={styles.uploadTypeSelect}
                      value={activeSelectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                    >
                      {documentSlots
                        .filter((slot) => slot.canSelect)
                        .map((slot) => (
                          <option key={slot.justificatifType} value={slot.justificatifType}>
                            {slot.label}
                          </option>
                        ))}
                    </select>
                  </>
                ) : (
                  <p className={styles.uploadContext}>
                    Tous les justificatifs requis ont été déposés.
                  </p>
                )}

                <p className={styles.uploadHintTitle}>
                  {selectedSlot
                    ? `Déposez : ${selectedSlot.label}`
                    : 'Sélectionnez un document à gauche'}
                </p>

                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className={styles.hiddenFile}
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />

                <UploadZone onClick={() => fileRef.current?.click()} />

                {selectedFile ? (
                  <p className={styles.selectedFile}>{selectedFile.name}</p>
                ) : null}

                {uploadError ? (
                  <p className={styles.uploadError} role="alert">
                    {uploadError}
                  </p>
                ) : null}
                {uploadSuccess ? (
                  <p className={styles.uploadSuccess} role="status">
                    {uploadSuccess}
                  </p>
                ) : null}

                <InfoBanner>
                  {activeSelectedType === 'piece_identite' ? (
                    <>Sandbox CNI (YouSign) : <code>verified_id_document_verification.pdf</code></>
                  ) : (
                    <>Vérification automatique IA (Mistral) — tout fichier PDF est accepté.</>
                  )}
                </InfoBanner>

                {!documentsReady && totalRequired > 0 ? (
                  <p className={styles.uploadContext}>
                    {readyCount}/{totalRequired} document
                    {totalRequired > 1 ? 's' : ''} conforme
                    {readyCount > 1 ? 's' : ''} — complétez tous les
                    justificatifs pour signer.
                  </p>
                ) : null}

                <Button
                  fullWidth
                  className={styles.submitBtn}
                  disabled={
                    !selectedFile ||
                    uploading ||
                    !token ||
                    !selectedSlot?.canSelect
                  }
                  onClick={() => void handleUpload()}
                >
                  <UploadCloudIcon />
                  {uploading ? 'Envoi…' : t('detail.submitDocuments')}
                </Button>

                <Button
                  fullWidth
                  variant="ghost"
                  disabled={!documentsReady || hasPendingVerification}
                  onClick={() =>
                    navigate(`/dossier/signature?contractId=${contractId}`)
                  }
                >
                  Continuer vers la signature
                </Button>
              </aside>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
