import { useMemo, useState, type FormEvent } from 'react'
import { useExternalAuth } from '@dynamic-labs/sdk-react-core'
import { mobilityApi } from '../../api/mobility-api'
import { useLabels } from '../../constants/labels'
import type {
  AnomalyCase,
  Contract,
  DynamicExternalJwtResult,
  ProofEvent,
  Support,
  SupportType,
  TransportRight,
  ValidateJourneyResult,
} from '../../domain/types/mobility'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Field } from '../ui/Field'
import { inputClassName, selectClassName } from '../ui/field-class-names'
import styles from './MultiSupportDemoPanel.module.css'

interface MultiSupportDemoPanelProps {
  identityId: string
  contracts: Contract[]
  supports: Support[]
  rights: TransportRight[]
  proofEvents: ProofEvent[]
  onRefresh: () => void
}

const stationOptions = [
  { value: 'gare-de-lyon', label: 'Gare de Lyon' },
  { value: 'bastille', label: 'Bastille' },
  { value: 'la-defense', label: 'La Defense' },
  { value: 'chatelet', label: 'Chatelet' },
]

export function MultiSupportDemoPanel({
  identityId,
  contracts,
  supports,
  rights,
  proofEvents,
  onRefresh,
}: MultiSupportDemoPanelProps) {
  const { signInWithExternalJwt } = useExternalAuth()
  const {
    productLabels,
    supportTypeLabels,
    transportRightStatusLabels,
    validationResultLabels,
  } = useLabels()
  const activeRight = rights.find((right) => right.status === 'active') ?? rights[0]
  const activeSupports = useMemo(
    () =>
      supports.filter(
        (support) =>
          support.status === 'active' &&
          (!activeRight || support.contractId === activeRight.contractId),
      ),
    [activeRight, supports],
  )
  const activeSupportCount = supports.filter((support) => support.status === 'active').length
  const contractForRight = useMemo(
    () => contracts.find((contract) => contract.status === 'active') ?? contracts[0],
    [contracts],
  )

  const [supportType, setSupportType] = useState<SupportType>('phone')
  const [walletAddress, setWalletAddress] = useState('0x7a9fDemoWallet')
  const [selectedSupportId, setSelectedSupportId] = useState('')
  const [stationId, setStationId] = useState('gare-de-lyon')
  const [occurredAt, setOccurredAt] = useState('2026-06-18T08:42')
  const [dynamicJwt, setDynamicJwt] = useState<DynamicExternalJwtResult | null>(null)
  const [dynamicSession, setDynamicSession] = useState<'idle' | 'linked' | 'fallback'>('idle')
  const [lastValidation, setLastValidation] = useState<ValidateJourneyResult | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const effectiveSupportId = activeSupports.some(
    (support) => support.id === selectedSupportId,
  )
    ? selectedSupportId
    : activeSupports[0]?.id ?? ''

  async function handleCreateRight() {
    if (!contractForRight) {
      setMessage('Creez d abord un abonnement pour la demo.')
      return
    }

    setLoading('right')
    setMessage(null)
    try {
      await mobilityApi.createTransportRight(identityId, {
        contractId: contractForRight.id,
        productType: contractForRight.productType,
        validFrom: contractForRight.validFrom,
        validTo: contractForRight.validTo,
      })
      onRefresh()
    } catch (err) {
      setMessage(errorMessage(err))
    } finally {
      setLoading(null)
    }
  }

  async function handleDynamicJwt() {
    setLoading('dynamic')
    setMessage(null)
    try {
      const issued = await mobilityApi.issueDynamicExternalJwt()
      setDynamicJwt(issued)
      try {
        const profile = await signInWithExternalJwt({
          externalJwt: issued.externalJwt,
          externalUserId: issued.externalUserId,
        })
        setDynamicSession(profile ? 'linked' : 'fallback')
        if (!profile) {
          setMessage('JWT genere, session Dynamic non retournee par le sandbox.')
        }
      } catch (err) {
        setDynamicSession('fallback')
        setMessage(`JWT genere, echange Dynamic sandbox non finalise: ${errorMessage(err)}`)
      }
    } catch (err) {
      setMessage(errorMessage(err))
    } finally {
      setLoading(null)
    }
  }

  async function handleActivateSupport(event: FormEvent) {
    event.preventDefault()
    if (!activeRight) {
      setMessage('Creez d abord un droit de transport.')
      return
    }

    setLoading('support')
    setMessage(null)
    try {
      await mobilityApi.activateSupport(identityId, {
        transportRightId: activeRight.id,
        type: supportType,
        walletAddress: supportType === 'physical_card' ? undefined : walletAddress,
      })
      onRefresh()
    } catch (err) {
      setMessage(errorMessage(err))
    } finally {
      setLoading(null)
    }
  }

  async function handleValidate(event: FormEvent) {
    event.preventDefault()
    const selectedSupport =
      activeSupports.find((support) => support.id === effectiveSupportId) ?? null
    if (!activeRight || !selectedSupport) {
      setMessage('Un droit actif et un support actif sont necessaires.')
      return
    }

    setLoading('validation')
    setMessage(null)
    try {
      const result = await mobilityApi.validateJourney(identityId, {
        transportRightId: activeRight.id,
        supportId: selectedSupport.id,
        stationId,
        validatorId: `validator-${stationId}`,
        occurredAt: new Date(occurredAt).toISOString(),
      })
      setLastValidation(result)
      onRefresh()
    } catch (err) {
      setMessage(errorMessage(err))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className={styles.stack}>
      {message ? <div className={styles.status}>{message}</div> : null}

      <div className={styles.columns}>
        <Card className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h3>Droit centralise</h3>
              <p className={styles.muted}>Le droit reste dans le SI, le support le presente.</p>
            </div>
            <Badge tone={activeRight ? 'success' : 'warning'}>
              {activeRight ? transportRightStatusLabels[activeRight.status] : 'A creer'}
            </Badge>
          </div>

          {activeRight ? (
            <>
              <div className={styles.row}>
                <span>Produit</span>
                <strong>
                  {productLabels[activeRight.productType as keyof typeof productLabels] ??
                    activeRight.productType}
                </strong>
              </div>
              <div className={styles.row}>
                <span>Commitment</span>
                <span className={styles.mono}>{compact(activeRight.rightCommitment)}</span>
              </div>
            </>
          ) : (
            <Button onClick={handleCreateRight} disabled={loading === 'right'}>
              Creer le droit demo
            </Button>
          )}
        </Card>

        <Card className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h3>Dynamic sandbox</h3>
              <p className={styles.muted}>JWT dedie aud=dynamic, fallback wallet simule.</p>
            </div>
            <Badge tone={dynamicJwt ? 'success' : 'neutral'}>
              {dynamicSession === 'linked'
                ? 'Session liee'
                : dynamicJwt
                  ? 'JWT pret'
                  : 'Non lie'}
            </Badge>
          </div>
          <Button variant="secondary" onClick={handleDynamicJwt} disabled={loading === 'dynamic'}>
            Lier Dynamic sandbox
          </Button>
          {dynamicJwt ? (
            <div className={styles.muted}>
              <div>External user: {dynamicJwt.externalUserId}</div>
              <div>Issuer: {dynamicJwt.issuer}</div>
              <div>Audience: {dynamicJwt.audience}</div>
              <div>Expire dans: {dynamicJwt.expiresIn}s</div>
              <div>JWKS: {dynamicJwt.jwksUrl}</div>
              <div className={styles.mono}>{compact(dynamicJwt.externalJwt)}</div>
            </div>
          ) : null}
        </Card>
      </div>

      <div className={styles.columns}>
        <Card className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h3>Activation support</h3>
              <p className={styles.muted}>Limite active: {activeSupportCount}/2 supports.</p>
            </div>
            <Badge tone={activeSupportCount >= 2 ? 'warning' : 'info'}>Max 2</Badge>
          </div>
          <form className={styles.form} onSubmit={handleActivateSupport}>
            <Field label="Support" htmlFor="supportTypeDemo">
              <select
                id="supportTypeDemo"
                className={selectClassName()}
                value={supportType}
                onChange={(event) => setSupportType(event.target.value as SupportType)}
              >
                {Object.entries(supportTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Wallet demo" htmlFor="walletDemo" hint="Ignore pour une carte physique.">
              <input
                id="walletDemo"
                className={inputClassName()}
                value={walletAddress}
                onChange={(event) => setWalletAddress(event.target.value)}
              />
            </Field>
            <Button type="submit" disabled={loading === 'support' || !activeRight}>
              Activer ce support
            </Button>
          </form>
        </Card>

        <Card className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h3>Validation simulee</h3>
              <p className={styles.muted}>Regle unique: fenetre courte impossible.</p>
            </div>
            <Badge tone={lastValidation?.anomaly ? 'warning' : 'neutral'}>
              {lastValidation ? validationResultLabels[lastValidation.validation.result] : 'Pret'}
            </Badge>
          </div>
          <form className={styles.form} onSubmit={handleValidate}>
            <Field label="Support actif" htmlFor="supportValidationDemo">
              <select
                id="supportValidationDemo"
                className={selectClassName()}
                value={effectiveSupportId}
                onChange={(event) => setSelectedSupportId(event.target.value)}
                disabled={activeSupports.length === 0}
              >
                {activeSupports.length === 0 ? (
                  <option value="">Aucun support actif</option>
                ) : (
                  activeSupports.map((support) => (
                    <option key={support.id} value={support.id}>
                      {supportTypeLabels[support.type]} - {compact(support.id)}
                    </option>
                  ))
                )}
              </select>
            </Field>
            <Field label="Station" htmlFor="stationDemo">
              <select
                id="stationDemo"
                className={selectClassName()}
                value={stationId}
                onChange={(event) => setStationId(event.target.value)}
              >
                {stationOptions.map((station) => (
                  <option key={station.value} value={station.value}>
                    {station.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Horaire" htmlFor="occurredAtDemo">
              <input
                id="occurredAtDemo"
                type="datetime-local"
                className={inputClassName()}
                value={occurredAt}
                onChange={(event) => setOccurredAt(event.target.value)}
              />
            </Field>
            <Button
              type="submit"
              disabled={loading === 'validation' || !activeRight || !effectiveSupportId}
            >
              Simuler la validation
            </Button>
          </form>
          {lastValidation?.anomaly ? (
            <div className={styles.status}>{lastValidation.anomaly.summary}</div>
          ) : null}
        </Card>
      </div>

      <Card className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h3>Registre de preuve</h3>
            <p className={styles.muted}>Evenements sensibles hashes, sans donnees civiles.</p>
          </div>
          <Badge tone={proofEvents.length > 0 ? 'success' : 'neutral'}>
            {String(proofEvents.length)}
          </Badge>
        </div>
        {proofEvents.length === 0 ? (
          <p className={styles.muted}>Aucune preuve enregistree.</p>
        ) : (
          <ul className={styles.proofList}>
            {proofEvents.map((event) => (
              <li key={event.id} className={styles.row}>
                <span>{event.type}</span>
                <span className={styles.mono}>{compact(event.eventHash)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export function AnomalySummary({ anomalies }: { anomalies: AnomalyCase[] }) {
  const { anomalyStatusLabels } = useLabels()

  if (anomalies.length === 0) return null

  return (
    <Card className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>Anomalies ouvertes</h3>
        <Badge tone="warning">{String(anomalies.length)}</Badge>
      </div>
      <ul className={styles.proofList}>
        {anomalies.map((anomaly) => (
          <li key={anomaly.id} className={styles.row}>
            <span>{anomaly.summary}</span>
            <Badge tone="warning">{anomalyStatusLabels[anomaly.status]}</Badge>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function compact(value: string): string {
  return value.length > 28 ? `${value.slice(0, 14)}...${value.slice(-8)}` : value
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Erreur inattendue'
}
