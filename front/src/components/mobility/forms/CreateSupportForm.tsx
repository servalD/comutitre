import { useState, type FormEvent } from 'react'
import type { CreateSupportPayload, SupportStatus } from '../../../domain/types/mobility'
import { Button } from '../../ui/Button'
import { Field } from '../../ui/Field'
import { selectClassName } from '../../ui/field-class-names'
import styles from './MobilityForms.module.css'

export function CreateSupportForm({
  onSubmit,
}: {
  onSubmit: (payload: CreateSupportPayload) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<SupportStatus>('active')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({ status })
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <span aria-hidden="true">➕</span> Ajouter une carte
      </Button>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3>Nouvelle carte physique</h3>
      <Field label="Statut" htmlFor="supportStatus">
        <select
          id="supportStatus"
          className={selectClassName()}
          value={status}
          onChange={(e) => setStatus(e.target.value as SupportStatus)}
        >
          <option value="active">Active</option>
          <option value="pending_activation">En attente</option>
          <option value="lost">Perdue</option>
          <option value="stolen">Volée</option>
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
