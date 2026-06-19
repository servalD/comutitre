import { supportStatusLabels, supportTypeLabels } from '../../constants/labels'
import type { Support, SupportStatus, SupportType } from '../../domain/types/mobility'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import styles from './ResourceList.module.css'

function supportTone(status: SupportStatus): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'active') return 'success'
  if (status === 'lost' || status === 'stolen') return 'danger'
  if (status === 'pending_activation' || status === 'support_non_reclame') {
    return 'warning'
  }
  return 'neutral'
}

export function SupportList({ supports }: { supports: Support[] }) {
  if (supports.length === 0) return null

  return (
    <ul className={styles.list}>
      {supports.map((support) => (
        <li key={support.id}>
          <Card className={styles.item}>
            <div className={styles.row}>
              <span className={styles.icon} aria-hidden="true">
                {supportIcon(support.type)}
              </span>
              <div>
                <strong>{supportTypeLabels[support.type]}</strong>
                <p className={styles.sub}>
                  {support.activatedAt
                    ? `Active le ${new Date(support.activatedAt).toLocaleDateString('fr-FR')}`
                    : 'En attente d activation'}
                </p>
                {support.walletAddress ? (
                  <p className={styles.sub}>Wallet {compact(support.walletAddress)}</p>
                ) : null}
                {support.supportCommitment ? (
                  <p className={styles.sub}>Commitment {compact(support.supportCommitment)}</p>
                ) : null}
                {support.expiresAt ? (
                  <p className={styles.sub}>
                    Expire le {new Date(support.expiresAt).toLocaleDateString('fr-FR')}
                  </p>
                ) : null}
              </div>
              <Badge tone={supportTone(support.status)}>
                {supportStatusLabels[support.status]}
              </Badge>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  )
}

function supportIcon(type: SupportType): string {
  if (type === 'phone') return 'TEL'
  if (type === 'watch') return 'W'
  return 'CB'
}

function compact(value: string): string {
  return value.length > 20 ? `${value.slice(0, 10)}...${value.slice(-6)}` : value
}
