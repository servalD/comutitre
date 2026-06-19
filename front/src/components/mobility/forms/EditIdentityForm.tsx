import { useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { MobilityIdentity, UpdateMobilityIdentityPayload } from '../../../domain/types/mobility'
import { formatEstimatedProfile } from '../identity-utils'
import { Button } from '../../ui/Button'
import { Field } from '../../ui/Field'
import { inputClassName } from '../../ui/field-class-names'
import styles from './MobilityForms.module.css'

export function EditIdentityForm({
  identity,
  onSubmit,
}: {
  identity: MobilityIdentity
  onSubmit: (payload: UpdateMobilityIdentityPayload) => Promise<void>
}) {
  const { t } = useTranslation('mobility')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [firstName, setFirstName] = useState(identity.firstName)
  const [lastName, setLastName] = useState(identity.lastName)
  const [birthDate, setBirthDate] = useState(identity.birthDate)

  const estimatedProfile = useMemo(
    () => formatEstimatedProfile(birthDate),
    [birthDate],
  )

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({ firstName, lastName, birthDate })
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <span aria-hidden="true">✏️</span> {t('editIdentity.edit')}
      </Button>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3>{t('editIdentity.title')}</h3>
      <div className={styles.row}>
        <Field label={t('forms.firstName')} htmlFor="firstName">
          <input
            id="firstName"
            className={inputClassName()}
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </Field>
        <Field label={t('forms.lastName')} htmlFor="lastName">
          <input
            id="lastName"
            className={inputClassName()}
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </Field>
      </div>
      <Field label={t('forms.birthDate')} htmlFor="birthDate">
        <input
          id="birthDate"
          type="date"
          className={inputClassName()}
          required
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
      </Field>
      {estimatedProfile ? (
        <p className={styles.estimatedProfile}>
          <span aria-hidden="true">🎫</span> {t('forms.estimatedProfile')}{' '}
          <strong>{estimatedProfile}</strong>
        </p>
      ) : null}
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
