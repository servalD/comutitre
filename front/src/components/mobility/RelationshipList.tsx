import { useTranslation } from 'react-i18next'
import { useLabels } from '../../constants/labels'
import type { Relationship } from '../../domain/types/mobility'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import styles from './RelationshipList.module.css'

interface RelationshipListProps {
  relationships: Relationship[]
  onRevoke?: (id: string) => void
  revokingId?: string | null
}

export function RelationshipList({
  relationships,
  onRevoke,
  revokingId,
}: RelationshipListProps) {
  const { t, i18n } = useTranslation('mobility')
  const { relationshipLabels } = useLabels()
  if (relationships.length === 0) return null

  return (
    <ul className={styles.list}>
      {relationships.map((rel) => (
        <li key={rel.id}>
          <Card className={styles.item}>
            <div className={styles.row}>
              <span aria-hidden="true">🔗</span>
              <div>
                <Badge tone="info">{relationshipLabels[rel.relationshipType]}</Badge>
                <p className={styles.sub}>
                  {t('relationship.since', {
                    date: new Date(rel.createdAt).toLocaleDateString(i18n.language),
                  })}
                </p>
              </div>
              {onRevoke && rel.status === 'active' ? (
                <Button
                  variant="ghost"
                  onClick={() => onRevoke(rel.id)}
                  disabled={revokingId === rel.id}
                >
                  {t('relationship.revoke')}
                </Button>
              ) : null}
            </div>
          </Card>
        </li>
      ))}
    </ul>
  )
}
