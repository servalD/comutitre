import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { CreateSupportPayload, SupportStatus } from '../../../domain/types/mobility'
import { useLabels } from '../../../constants/labels'
import { Button } from '../../ui/Button'
import { Field } from '../../ui/Field'
import { selectClassName } from '../../ui/field-class-names'
import styles from './MobilityForms.module.css'

export function CreateSupportForm({
  onSubmit,
}: {
  onSubmit: (payload: CreateSupportPayload) => Promise<void>
}) {
  const { t } = useTranslation('mobility')
  const { supportStatusLabels } = useLabels()
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
        <span aria-hidden="true">➕</span> {t('createSupport.add')}
      </Button>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3>{t('createSupport.title')}</h3>
      <Field label={t('forms.status')} htmlFor="supportStatus">
        <select
          id="supportStatus"
          className={selectClassName()}
          value={status}
          onChange={(e) => setStatus(e.target.value as SupportStatus)}
        >
          <option value="active">{supportStatusLabels.active}</option>
          <option value="pending_activation">{supportStatusLabels.pending_activation}</option>
          <option value="lost">{supportStatusLabels.lost}</option>
          <option value="stolen">{supportStatusLabels.stolen}</option>
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
