import {
  foundSupportDecisionLabels,
  foundSupportFinalStatusLabels,
  timelineEventLabels,
} from '../../constants/labels'
import type {
  FoundSupportDecision,
  FoundSupportFinalStatus,
  TimelineEvent,
} from '../../domain/types/mobility'
import styles from './TimelineList.module.css'

const eventIcons: Record<string, string> = {
  MOBILITY_IDENTITY_CREATED: 'I',
  MOBILITY_IDENTITY_UPDATED: 'M',
  RELATIONSHIP_CREATED: 'L',
  CONTRACT_CREATED: 'C',
  DOCUMENT_UPLOADED: 'D',
  SUPPORT_ADDED: 'S',
  SUPPORT_FOUND: '?',
  SUPPORT_FOUND_CLOSED: 'V',
}

function getMetadataText(event: TimelineEvent): string | null {
  if (event.type === 'SUPPORT_FOUND') {
    const decision = event.metadata?.decision
    const deadline = event.metadata?.pickupDeadline
    const parts: string[] = []

    if (typeof decision === 'string') {
      parts.push(
        foundSupportDecisionLabels[decision as FoundSupportDecision] ?? decision,
      )
    }

    if (typeof deadline === 'string') {
      parts.push(
        `Retrait avant le ${new Date(deadline).toLocaleDateString('fr-FR')}`,
      )
    }

    return parts.length > 0 ? parts.join(' - ') : null
  }

  if (event.type === 'SUPPORT_FOUND_CLOSED') {
    const finalStatus = event.metadata?.finalStatus
    if (typeof finalStatus === 'string') {
      return (
        foundSupportFinalStatusLabels[finalStatus as FoundSupportFinalStatus] ??
        finalStatus
      )
    }
  }

  return null
}

export function TimelineList({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) return null

  return (
    <ol className={styles.timeline}>
      {events.map((event) => {
        const metadataText = getMetadataText(event)

        return (
          <li key={event.id} className={styles.item}>
            <span className={styles.dot} aria-hidden="true">
              {eventIcons[event.type] ?? '-'}
            </span>
            <div>
              <strong>{timelineEventLabels[event.type] ?? event.type}</strong>
              {metadataText && <p className={styles.meta}>{metadataText}</p>}
              <time className={styles.time} dateTime={event.createdAt}>
                {new Date(event.createdAt).toLocaleString('fr-FR')}
              </time>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
