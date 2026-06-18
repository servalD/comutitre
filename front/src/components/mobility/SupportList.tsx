import { supportStatusLabels } from '../../constants/labels'
import type { Support, SupportStatus } from '../../domain/types/mobility'
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
                💳
              </span>
              <div>
                <strong>Carte Navigo</strong>
                <p className={styles.sub}>
                  {support.activatedAt
                    ? `Activée le ${new Date(support.activatedAt).toLocaleDateString('fr-FR')}`
                    : 'Carte physique'}
                </p>
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
