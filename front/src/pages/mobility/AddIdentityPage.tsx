import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { mobilityApi } from '../../api/mobility-api'
import { ApiError } from '../../api/http-client'
import {
  CreateIdentityForm,
  type CreateIdentityFormValues,
} from '../../components/mobility/forms/CreateIdentityForm'
import { Card } from '../../components/ui/Card'
import styles from './MobilityPages.module.css'

const ADDED_PERSON_RELATIONSHIPS = ['payer', 'legal_guardian'] as const

export function AddIdentityPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(values: CreateIdentityFormValues) {
    setLoading(true)
    setError(null)
    try {
      const identity = await mobilityApi.createIdentity({
        firstName: values.firstName,
        lastName: values.lastName,
        birthDate: values.birthDate,
      })

      for (const relationshipType of ADDED_PERSON_RELATIONSHIPS) {
        await mobilityApi.createRelationship({
          mobilityIdentityId: identity.id,
          relationshipType,
        })
      }

      navigate(`/mobility/${identity.id}`, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Création impossible')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <Link to="/mobility" className={styles.back}>
        <span aria-hidden="true">←</span> Retour
      </Link>
      <header className={styles.header}>
        <div>
          <h1>Ajouter une personne</h1>
          <p>
            Enfant, neveu ou proche : ajoutez une identité de mobilité à gérer
            depuis votre espace.
          </p>
        </div>
      </header>

      <Card>
        <CreateIdentityForm onSubmit={handleCreate} loading={loading} />
        {error ? <p className={styles.status}>{error}</p> : null}
      </Card>
    </div>
  )
}
