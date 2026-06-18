import { useMemo, useState, type FormEvent } from 'react'
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
      <p className={styles.hint}>
        Ajoutez une personne à gérer depuis votre espace. Vous serez son payeur
        et son représentant légal jusqu&apos;à ce qu&apos;elle dispose de son
        propre compte.
      </p>

      <div className={styles.row}>
        <Field label="Prénom" htmlFor="newFirstName">
          <input
            id="newFirstName"
            className={inputClassName()}
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </Field>
        <Field label="Nom" htmlFor="newLastName">
          <input
            id="newLastName"
            className={inputClassName()}
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </Field>
      </div>

      <Field label="Date de naissance" htmlFor="newBirthDate">
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
          <span aria-hidden="true">🎫</span> Profil estimé :{' '}
          <strong>{estimatedProfile}</strong>
        </p>
      ) : null}

      <div className={styles.actions}>
        <Button type="submit" disabled={loading}>
          Ajouter à mon espace
        </Button>
      </div>
    </form>
  )
}
