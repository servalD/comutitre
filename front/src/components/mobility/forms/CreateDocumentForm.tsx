import { useState, type FormEvent } from 'react'
import type { CreateDocumentPayload, DocumentType } from '../../../domain/types/mobility'
import { documentTypeLabels } from '../../../constants/labels'
import { Button } from '../../ui/Button'
import { Field } from '../../ui/Field'
import { selectClassName } from '../../ui/field-class-names'
import styles from './MobilityForms.module.css'

export function CreateDocumentForm({
  onSubmit,
}: {
  onSubmit: (payload: CreateDocumentPayload) => Promise<void>
}) {
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
        <span aria-hidden="true">➕</span> Ajouter un document
      </Button>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3>Nouveau document</h3>
      <Field label="Type" htmlFor="docType">
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
          Enregistrer
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Annuler
        </Button>
      </div>
    </form>
  )
}
