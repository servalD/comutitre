import { useTranslation } from 'react-i18next'
import { labelFor } from '../../constants/labels'
import type { TimelineEvent } from '../../domain/types/mobility'
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

function getMetadataText(
  event: TimelineEvent,
  t: ReturnType<typeof useTranslation<'mobility'>>['t'],
  locale: string,
): string | null {
  if (event.type === 'SUPPORT_FOUND') {
    const decision = event.metadata?.decision
    const deadline = event.metadata?.pickupDeadline
    const parts: string[] = []

    if (typeof decision === 'string') {
      parts.push(labelFor.foundSupportDecision(decision as never) ?? decision)
    }

    if (typeof deadline === 'string') {
      parts.push(
        t('timeline.pickupBefore', {
          date: new Date(deadline).toLocaleDateString(locale),
        }),
      )
    }

    return parts.length > 0 ? parts.join(' - ') : null
  }

  if (event.type === 'SUPPORT_FOUND_CLOSED') {
    const finalStatus = event.metadata?.finalStatus
    if (typeof finalStatus === 'string') {
      return labelFor.foundSupportFinalStatus(finalStatus as never) ?? finalStatus
    }
  }

  return null
}

export function TimelineList({ events }: { events: TimelineEvent[] }) {
  const { t, i18n } = useTranslation('mobility')
  if (events.length === 0) return null

  return (
    <ol className={styles.timeline}>
      {events.map((event) => {
        const metadataText = getMetadataText(event, t, i18n.language)

        return (
          <li key={event.id} className={styles.item}>
            <span className={styles.dot} aria-hidden="true">
              {eventIcons[event.type] ?? '-'}
            </span>
            <div>
              <strong>{labelFor.timelineEvent(event.type) ?? event.type}</strong>
              {metadataText && <p className={styles.meta}>{metadataText}</p>}
              <time className={styles.time} dateTime={event.createdAt}>
                {new Date(event.createdAt).toLocaleString(i18n.language)}
              </time>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
