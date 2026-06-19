import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  CreateContractPayload,
  ProductType,
  ContractStatus,
} from '../../../domain/types/mobility'
import { useLabels } from '../../../constants/labels'
import { Button } from '../../ui/Button'
import { Field } from '../../ui/Field'
import { inputClassName, selectClassName } from '../../ui/field-class-names'
import styles from './MobilityForms.module.css'

interface CreateContractFormProps {
  onSubmit: (payload: CreateContractPayload) => Promise<void>
}

export function CreateContractForm({ onSubmit }: CreateContractFormProps) {
  const { t } = useTranslation('mobility')
  const { productLabels, contractStatusLabels } = useLabels()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [productType, setProductType] = useState<ProductType>('imagine_r_scolaire')
  const [status, setStatus] = useState<ContractStatus>('active')
  const [validFrom, setValidFrom] = useState('')
  const [validTo, setValidTo] = useState('')
  const [tariff, setTariff] = useState('350')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        productType,
        status,
        validFrom: new Date(validFrom).toISOString(),
        validTo: new Date(validTo).toISOString(),
        currentTariff: Number(tariff),
      })
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <span aria-hidden="true">➕</span> {t('createContract.add')}
      </Button>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3>{t('createContract.title')}</h3>
      <Field label={t('forms.product')} htmlFor="productType">
        <select
          id="productType"
          className={selectClassName()}
          value={productType}
          onChange={(e) => setProductType(e.target.value as ProductType)}
        >
          {Object.entries(productLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t('forms.status')} htmlFor="status">
        <select
          id="status"
          className={selectClassName()}
          value={status}
          onChange={(e) => setStatus(e.target.value as ContractStatus)}
        >
          <option value="active">{contractStatusLabels.active}</option>
          <option value="expired">{contractStatusLabels.expired}</option>
          <option value="draft">{contractStatusLabels.draft}</option>
          <option value="suspended">{contractStatusLabels.suspended}</option>
        </select>
      </Field>
      <div className={styles.row}>
        <Field label={t('forms.start')} htmlFor="validFrom">
          <input
            id="validFrom"
            type="date"
            className={inputClassName()}
            required
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
          />
        </Field>
        <Field label={t('forms.end')} htmlFor="validTo">
          <input
            id="validTo"
            type="date"
            className={inputClassName()}
            required
            value={validTo}
            onChange={(e) => setValidTo(e.target.value)}
          />
        </Field>
      </div>
      <Field label={t('forms.tariff')} htmlFor="tariff">
        <input
          id="tariff"
          type="number"
          min="0"
          step="0.01"
          className={inputClassName()}
          required
          value={tariff}
          onChange={(e) => setTariff(e.target.value)}
        />
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
