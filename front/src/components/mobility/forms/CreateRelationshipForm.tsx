import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  CreateRelationshipPayload,
  RelationshipType,
} from '../../../domain/types/mobility'
import { useLabels } from '../../../constants/labels'
import { Button } from '../../ui/Button'
import { Field } from '../../ui/Field'
import { selectClassName } from '../../ui/field-class-names'
import styles from './MobilityForms.module.css'

export function CreateRelationshipForm({
  identityId,
  existingTypes,
  onSubmit,
}: {
  identityId: string
  existingTypes: RelationshipType[]
  onSubmit: (payload: CreateRelationshipPayload) => Promise<void>
}) {
  const { t } = useTranslation('mobility')
  const { relationshipLabels } = useLabels()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const available = (
    ['owner', 'legal_guardian', 'payer', 'manager', 'read_only'] as RelationshipType[]
  ).filter((type) => !existingTypes.includes(type))
  const [relationshipType, setRelationshipType] = useState<RelationshipType>(
    available[0] ?? 'read_only',
  )

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({ mobilityIdentityId: identityId, relationshipType })
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  if (available.length === 0) {
    return <p className={styles.hint}>{t('createRelationship.allCreated')}</p>
  }

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <span aria-hidden="true">🔗</span> {t('createRelationship.link')}
      </Button>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3>{t('createRelationship.title')}</h3>
      <Field label={t('createRelationship.linkType')} htmlFor="relType">
        <select
          id="relType"
          className={selectClassName()}
          value={relationshipType}
          onChange={(e) => setRelationshipType(e.target.value as RelationshipType)}
        >
          {available.map((value) => (
            <option key={value} value={value}>
              {relationshipLabels[value]}
            </option>
          ))}
        </select>
      </Field>
      <div className={styles.actions}>
        <Button type="submit" disabled={loading}>
          {t('common:actions.save')}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          {t('common:actions.cancel')}
        </Button>
      </div>
    </form>
  )
}
