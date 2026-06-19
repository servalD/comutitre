import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { CreateDocumentPayload, DocumentType } from '../../../domain/types/mobility'
import { useLabels } from '../../../constants/labels'
import { Button } from '../../ui/Button'
import { Field } from '../../ui/Field'
import { selectClassName } from '../../ui/field-class-names'
import styles from './MobilityForms.module.css'

export function CreateDocumentForm({
  onSubmit,
}: {
  onSubmit: (payload: CreateDocumentPayload) => Promise<void>
}) {
  const { t } = useTranslation('mobility')
  const { documentTypeLabels } = useLabels()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<DocumentType>('school_certificate')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({ type, status: 'uploaded' })
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <span aria-hidden="true">➕</span> {t('createDocument.add')}
      </Button>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3>{t('createDocument.title')}</h3>
      <Field label={t('forms.type')} htmlFor="docType">
        <select
          id="docType"
          className={selectClassName()}
          value={type}
          onChange={(e) => setType(e.target.value as DocumentType)}
        >
          {Object.entries(documentTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
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
