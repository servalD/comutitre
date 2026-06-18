import {
  documentStatusLabels,
  documentTypeLabels,
} from '../../constants/labels'
import type { Document, DocumentStatus } from '../../domain/types/mobility'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import styles from './ResourceList.module.css'

function docTone(status: DocumentStatus): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'accepted') return 'success'
  if (status === 'refused') return 'danger'
  if (status === 'pending_verification') return 'warning'
  return 'neutral'
}

export function DocumentList({ documents }: { documents: Document[] }) {
  if (documents.length === 0) return null

  return (
    <ul className={styles.list}>
      {documents.map((doc) => (
        <li key={doc.id}>
          <Card className={styles.item}>
            <div className={styles.row}>
              <span className={styles.icon} aria-hidden="true">
                📄
              </span>
              <div>
                <strong>{documentTypeLabels[doc.type]}</strong>
                <p className={styles.sub}>
                  Déposé le {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <Badge tone={docTone(doc.status)}>
                {documentStatusLabels[doc.status]}
              </Badge>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  )
}
