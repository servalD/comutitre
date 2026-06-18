import { timelineEventLabels } from '../../constants/labels'
import type { TimelineEvent } from '../../domain/types/mobility'
import styles from './TimelineList.module.css'

const eventIcons: Record<string, string> = {
  MOBILITY_IDENTITY_CREATED: '👤',
  MOBILITY_IDENTITY_UPDATED: '✏️',
  RELATIONSHIP_CREATED: '🔗',
  CONTRACT_CREATED: '🎫',
  DOCUMENT_UPLOADED: '📄',
  SUPPORT_ADDED: '💳',
}

export function TimelineList({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) return null

  return (
    <ol className={styles.timeline}>
      {events.map((event) => (
        <li key={event.id} className={styles.item}>
          <span className={styles.dot} aria-hidden="true">
            {eventIcons[event.type] ?? '•'}
          </span>
          <div>
            <strong>{timelineEventLabels[event.type] ?? event.type}</strong>
            <time className={styles.time} dateTime={event.createdAt}>
              {new Date(event.createdAt).toLocaleString('fr-FR')}
            </time>
          </div>
        </li>
      ))}
    </ol>
  )
}
