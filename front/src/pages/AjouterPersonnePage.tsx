import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { mobilityApi } from '../api/mobility-api'
import { AppLayout } from '../components/layout/AppLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { InfoBanner } from '../components/ui/InfoBanner'
import styles from './AjouterPersonnePage.module.css'

type RelationChoice = 'child' | 'partner' | 'other'

const RELATION_IDS: RelationChoice[] = ['child', 'partner', 'other']

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
  const location = useLocation()
  const returnTo: string = (location.state as { from?: string } | null)?.from ?? '/foyer'
  const { t } = useTranslation('foyer')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [relation, setRelation] = useState<RelationChoice>('child')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const age = calculateAge(birthDate)
  const isMinor = age !== null && age < 18
  const canSubmit = firstName.trim() !== '' && lastName.trim() !== '' && birthDate !== ''

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      await mobilityApi.createIdentity({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthDate,
      })
      navigate(returnTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de créer la personne.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppLayout activeTab="foyer">
      <div className={styles.page}>
        <PageHeader title={t('foyer.addPerson')} backTo="/foyer" />
        <p className={styles.subtitle}>{t('addPerson.subtitle')}</p>

        <form onSubmit={(e) => void handleSubmit(e)} className={styles.form} noValidate>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="firstName">{t('addPerson.firstName')}</label>
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
              <label className={styles.label} htmlFor="lastName">{t('addPerson.lastName')}</label>
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
            <label className={styles.label} htmlFor="birthDate">{t('addPerson.birthDate')}</label>
            <input
              id="birthDate"
              type="date"
              className={styles.input}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
            <p className={styles.hint}>{t('addPerson.birthHint')}</p>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t('addPerson.relation')} <span className={styles.optional}>{t('addPerson.optional')}</span></label>
            <div className={styles.chips}>
              {RELATION_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={[styles.chip, relation === id ? styles.chipActive : ''].filter(Boolean).join(' ')}
                  onClick={() => setRelation(id)}
                  aria-pressed={relation === id}
                >
                  {relation === id && <CheckIcon />}
                  {t(`addPerson.relations.${id}`)}
                </button>
              ))}
            </div>
          </div>

          {isMinor && <InfoBanner>{t('addPerson.minorNotice')}</InfoBanner>}

          {error && (
            <p className={styles.error} role="alert">{error}</p>
          )}

          <div className={styles.actions}>
            <Button type="submit" fullWidth disabled={!canSubmit || submitting}>
              {submitting ? '…' : t('addPerson.submit')}
            </Button>
            <Link to={returnTo} className={styles.cancelLink}>
              {t('common:actions.cancel')}
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
