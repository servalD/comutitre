import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { InfoBanner } from '../components/ui/InfoBanner'
import styles from './AjouterPersonnePage.module.css'

type RelationChoice = 'child' | 'partner' | 'other'

const RELATIONS: Array<{ id: RelationChoice; label: string }> = [
  { id: 'child', label: 'Enfant' },
  { id: 'partner', label: 'Conjoint' },
  { id: 'other', label: 'Autre' },
]

function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  if (isNaN(birth.getTime())) return null
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export function AjouterPersonnePage() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [relation, setRelation] = useState<RelationChoice>('child')

  const age = calculateAge(birthDate)
  const isMinor = age !== null && age < 18

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/souscription/nouvelle')
  }

  return (
    <AppLayout activeTab="foyer">
      <div className={styles.page}>
        <PageHeader title="Ajouter une personne" backTo="/foyer" />
        <p className={styles.subtitle}>Cette personne sera ajoutée à votre foyer</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="firstName">Prénom</label>
              <input
                id="firstName"
                type="text"
                className={styles.input}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Léa"
                autoComplete="given-name"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="lastName">Nom</label>
              <input
                id="lastName"
                type="text"
                className={styles.input}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Dupont"
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="birthDate">Date de naissance</label>
            <input
              id="birthDate"
              type="date"
              className={styles.input}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
            <p className={styles.hint}>Permet de déterminer le forfait adapté</p>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Lien avec vous <span className={styles.optional}>(optionnel)</span></label>
            <div className={styles.chips}>
              {RELATIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={[styles.chip, relation === r.id ? styles.chipActive : ''].filter(Boolean).join(' ')}
                  onClick={() => setRelation(r.id)}
                  aria-pressed={relation === r.id}
                >
                  {relation === r.id && <CheckIcon />}
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {isMinor && (
            <InfoBanner>
              Si la personne est mineure, vous serez payeur et responsable légal par défaut.
            </InfoBanner>
          )}

          <div className={styles.actions}>
            <Button type="submit" fullWidth>
              Ajouter et continuer
            </Button>
            <Link to="/foyer" className={styles.cancelLink}>
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
