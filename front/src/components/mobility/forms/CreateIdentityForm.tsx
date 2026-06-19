import { useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { CreateMobilityIdentityPayload } from '../../../domain/types/mobility'
import { formatEstimatedProfile } from '../identity-utils'
import { Button } from '../../ui/Button'
import { Field } from '../../ui/Field'
import { inputClassName } from '../../ui/field-class-names'
import styles from './MobilityForms.module.css'

export type CreateIdentityFormValues = Pick<
  CreateMobilityIdentityPayload,
  'firstName' | 'lastName' | 'birthDate'
>

interface CreateIdentityFormProps {
  onSubmit: (values: CreateIdentityFormValues) => Promise<void>
  loading?: boolean
}

export function CreateIdentityForm({ onSubmit, loading }: CreateIdentityFormProps) {
  const { t } = useTranslation('mobility')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDate, setBirthDate] = useState('')

  const estimatedProfile = useMemo(
    () => formatEstimatedProfile(birthDate),
    [birthDate],
  )

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await onSubmit({ firstName, lastName, birthDate })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <p className={styles.hint}>{t('createIdentity.hint')}</p>

      <div className={styles.row}>
        <Field label={t('forms.firstName')} htmlFor="newFirstName">
          <input
            id="newFirstName"
            className={inputClassName()}
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </Field>
        <Field label={t('forms.lastName')} htmlFor="newLastName">
          <input
            id="newLastName"
            className={inputClassName()}
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </Field>
      </div>

      <Field label={t('forms.birthDate')} htmlFor="newBirthDate">
        <input
          id="newBirthDate"
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
          {t('createIdentity.submit')}
        </Button>
      </div>
    </form>
  )
}
