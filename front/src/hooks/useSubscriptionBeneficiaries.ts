import { useEffect, useState } from 'react'
import { mobilityApi } from '../api/mobility-api'
import { ApiError } from '../api/http-client'
import { useAuth } from '../contexts/AuthContext'
import type { DataSource, SubscriptionBeneficiaryView } from '../data/household-from-api'
import {
  mapIdentitiesToSubscriptionBeneficiaries,
  mockSubscriptionBeneficiaries,
} from '../data/household-from-api'

export interface SubscriptionBeneficiariesData {
  beneficiaries: SubscriptionBeneficiaryView[]
  source: DataSource
  loading: boolean
  error: string | null
}

interface BeneficiariesCache {
  token: string
  beneficiaries: SubscriptionBeneficiaryView[]
  source: DataSource
  error: string | null
}

export function useSubscriptionBeneficiaries(): SubscriptionBeneficiariesData {
  const { token } = useAuth()
  const [cache, setCache] = useState<BeneficiariesCache | null>(null)

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

    mobilityApi
      .listMyIdentities()
      .then((identities) => {
        if (cancelled) return

        const fromApi = mapIdentitiesToSubscriptionBeneficiaries(identities)
        setCache({
          token,
          beneficiaries:
            fromApi.length > 0 ? fromApi : mockSubscriptionBeneficiaries(),
          source: fromApi.length > 0 ? 'api' : 'mock',
          error: null,
        })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setCache({
          token,
          beneficiaries: mockSubscriptionBeneficiaries(),
          source: 'mock',
          error:
            err instanceof ApiError
              ? 'Impossible de charger votre foyer.'
              : 'Erreur de chargement.',
        })
      })

    return () => {
      cancelled = true
    }
  }, [token])

  if (!token) {
    return {
      beneficiaries: mockSubscriptionBeneficiaries(),
      source: 'mock',
      loading: false,
      error: null,
    }
  }

  if (!cache || cache.token !== token) {
    return {
      beneficiaries: mockSubscriptionBeneficiaries(),
      source: 'mock',
      loading: true,
      error: null,
    }
  }

  return {
    beneficiaries: cache.beneficiaries,
    source: cache.source,
    loading: false,
    error: cache.error,
  }
}
