import type { ContractStatus } from '../../domain/types/mobility'
import { contractStatusLabels, productLabels } from '../../constants/labels'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import styles from './ResourceList.module.css'

function statusTone(status: ContractStatus): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'active') return 'success'
  if (status === 'expired' || status === 'cancelled') return 'neutral'
  if (status === 'blocked_unpaid' || status === 'suspended') return 'danger'
  return 'warning'
}

interface ContractListProps {
  contracts: import('../../domain/types/mobility').Contract[]
}

export function ContractList({ contracts }: ContractListProps) {
  if (contracts.length === 0) return null

  return (
    <ul className={styles.list}>
      {contracts.map((contract) => (
        <li key={contract.id}>
          <Card className={styles.item}>
            <div className={styles.row}>
              <span className={styles.icon} aria-hidden="true">
                🎫
              </span>
              <div>
                <strong>{productLabels[contract.productType]}</strong>
                <p className={styles.sub}>
                  {formatDate(contract.validFrom)} → {formatDate(contract.validTo)}
                </p>
                <p className={styles.sub}>{contract.currentTariff.toFixed(2)} €</p>
              </div>
              <Badge tone={statusTone(contract.status)}>
                {contractStatusLabels[contract.status]}
              </Badge>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR')
}
