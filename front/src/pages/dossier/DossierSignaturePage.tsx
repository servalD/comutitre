import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { contractsApi, type ContractResponse } from '../../api/contracts'
import { justificatifsApi } from '../../api/justificatifs'
import { AppLayout } from '../../components/layout/AppLayout'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { DossierSubStepper } from '../../components/dossier/DossierSubStepper'
import { useAuth } from '../../contexts/AuthContext'
import { DOSSIER_SUB_STEPS } from '../../data/mock'
import {
  allRequiredDocumentsReady,
  buildRequiredDocumentSlots,
} from '../../domain/justificatif-slots'
import { productLabelFromContractCode } from '../../domain/subscription-dossier'
import { CgvuPdfViewer } from '../../components/dossier/CgvuPdfViewer'
import styles from './DossierSignaturePage.module.css'

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function DossierSignaturePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const contractId = searchParams.get('contractId') ?? ''
  const { token } = useAuth()

  const [contract, setContract] = useState<ContractResponse | null>(null)
  const canLoad = Boolean(token && contractId)
  const [loading, setLoading] = useState(canLoad)
  const [accepted, setAccepted] = useState(false)
  const [signing, setSigning] = useState(false)
  const [signError, setSignError] = useState<string | null>(null)
  const [documentsReady, setDocumentsReady] = useState(false)

  useEffect(() => {
    if (!token || !contractId) return

    let cancelled = false
    Promise.all([
      contractsApi.get(token, contractId),
      justificatifsApi.list(token, contractId),
      contractsApi.getDocumentsReadiness(token, contractId),
    ])
      .then(([c, uploads, readiness]) => {
        if (cancelled) return
        setContract(c)
        const slots = buildRequiredDocumentSlots(c.productCode, uploads)
        setDocumentsReady(
          readiness.complete && allRequiredDocumentsReady(slots),
        )
        if (!readiness.complete || !allRequiredDocumentsReady(slots)) {
          navigate(`/dossier?contractId=${contractId}`, { replace: true })
        }
      })
      .catch(() => {
        if (!cancelled) navigate('/dossier', { replace: true })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token, contractId, navigate])

  async function handleSign() {
    if (!token || !contractId || !accepted) return
    setSigning(true)
    setSignError(null)
    try {
      const result = await contractsApi.startSignature(token, contractId)
      if (
        result.alreadySigned ||
        result.contractStatus === 'en_attente_paiement' ||
        result.contractStatus === 'actif'
      ) {
        navigate(`/dossier/paiement?contractId=${contractId}`)
        return
      }
      if (result.signatureLink) {
        const popup = window.open(result.signatureLink, '_blank', 'noopener,noreferrer')
        if (!popup) {
          setSignError(
            'Impossible d’ouvrir un nouvel onglet. Autorisez les pop-ups pour ce site, puis réessayez.',
          )
        }
        setSigning(false)
      } else {
        setSignError('Lien de signature non disponible. Réessayez dans quelques instants.')
        setSigning(false)
      }
    } catch (err) {
      setSignError(err instanceof Error ? err.message : 'Erreur lors du lancement de la signature')
      setSigning(false)
    }
  }

  useEffect(() => {
    if (!token || !contractId || !contract) return
    if (contract.status === 'en_attente_paiement') {
      navigate(`/dossier/paiement?contractId=${contractId}`, { replace: true })
      return
    }
    if (
      contract.status === 'actif' ||
      contract.status === 'en_attente_de_validation_documentaire'
    ) {
      navigate(`/dossier/validation?contractId=${contractId}`, { replace: true })
    }
  }, [token, contractId, contract, navigate])

  useEffect(() => {
    if (!token || !contractId) return
    if (contract?.status !== 'signature_en_cours') return

    let cancelled = false

    async function pollSignature() {
      try {
        const status = await contractsApi.getSignatureStatus(token!, contractId)
        if (cancelled) return
        if (
          status.alreadySigned ||
          status.contractStatus === 'en_attente_paiement' ||
          status.contractStatus === 'actif'
        ) {
          navigate(`/dossier/paiement?contractId=${contractId}`, { replace: true })
          return
        }
        if (status.contractStatus === 'en_attente_de_validation_documentaire') {
          navigate(`/dossier/validation?contractId=${contractId}`, { replace: true })
          return
        }
        if (status.contractStatus !== contract?.status) {
          const refreshed = await contractsApi.get(token!, contractId)
          if (!cancelled) setContract(refreshed)
        }
      } catch {
        // ignore polling errors
      }
    }

    void pollSignature()
    const onFocus = () => void pollSignature()
    window.addEventListener('focus', onFocus)
    const interval = window.setInterval(() => void pollSignature(), 8000)

    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
      window.clearInterval(interval)
    }
  }, [token, contractId, contract?.status, navigate])

  if (loading) {
    return (
      <AppLayout activeTab="accueil">
        <div className={styles.page}>
          <PageHeader title="Mon dossier" backTo="/dossier" />
          <p>Chargement…</p>
        </div>
      </AppLayout>
    )
  }

  if (!contract || !documentsReady) {
    return null
  }

  const productLabel = productLabelFromContractCode(contract.productCode)
  const beneficiaryName =
    `${contract.holderFirstName ?? ''} ${contract.holderLastName ?? ''}`.trim() ||
    contract.holderEmail
  const payerName =
    `${contract.payerFirstName ?? ''} ${contract.payerLastName ?? ''}`.trim() ||
    contract.payerEmail ||
    'Compte connecté'

  return (
    <AppLayout activeTab="accueil">
      <div className={styles.page}>
        <PageHeader
          title="Mon dossier"
          backTo={`/dossier?contractId=${contractId}`}
        />

        <div className={styles.stepperWrap}>
          <DossierSubStepper steps={DOSSIER_SUB_STEPS} currentStep={2} />
        </div>

        <p className={styles.context}>
          En tant que payeur, vous devez signer les CGVU pour valider la
          souscription de {beneficiaryName.split(' ')[0] ?? 'le bénéficiaire'}.
        </p>

        <div className={styles.layout}>
          <div className={styles.main}>
            {token ? (
              <CgvuPdfViewer
                token={token}
                contractId={contractId}
                title="Conditions Générales de Vente et d'Utilisation"
                subtitle={`Version ${contract.cgvuVersion} — ${productLabel}`}
              />
            ) : null}

            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className={styles.checkbox}
              />
              <span>J&apos;ai lu et j&apos;accepte les CGVU</span>
            </label>

            <div className={styles.yousignBanner}>
              <span className={styles.yousignBadge}>
                <ShieldIcon />
                Signature électronique sécurisée
              </span>
              <span className={styles.yousignBrand}>via <strong>YouSign</strong></span>
            </div>

            {signError ? (
              <p className={styles.signError} role="alert">
                {signError}
              </p>
            ) : null}

            {contract.status === 'signature_en_cours' && contract.yousignSignatureLink ? (
              <p className={styles.pendingSignHint}>
                Signature en cours sur YouSign. Une fois terminée, revenez sur cet
                onglet — vous serez redirigé automatiquement vers le paiement.
              </p>
            ) : null}
          </div>

          <div className={styles.sidebar}>
            <div className={styles.recap}>
              <p className={styles.recapTitle}>Récapitulatif</p>
              <div className={styles.recapRow}>
                <span className={styles.recapLabel}>Forfait</span>
                <span className={styles.recapValue}>{productLabel}</span>
              </div>
              <div className={styles.recapRow}>
                <span className={styles.recapLabel}>Bénéficiaire</span>
                <span className={styles.recapValue}>{beneficiaryName}</span>
              </div>
              <div className={styles.recapRow}>
                <span className={styles.recapLabel}>Payeur</span>
                <span className={styles.recapValue}>{payerName}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <Button
            className={styles.signBtn}
            disabled={!accepted || signing}
            onClick={() => void handleSign()}
          >
            <ShieldIcon />
            {signing ? 'Ouverture de YouSign…' : 'Signer les CGVU'}
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
