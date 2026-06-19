import { useEffect, useState } from 'react'
import { contractsApi } from '../api/contracts'
import { justificatifsApi } from '../api/justificatifs'
import { mobilityApi } from '../api/mobility-api'
import { ApiError } from '../api/http-client'
import { useAuth } from '../contexts/AuthContext'
import type {
  DataSource,
  HouseholdMemberView,
} from '../data/household-from-api'
import {
  findOwnerFirstName,
  greetingFromDisplayName,
  mapIdentityToMember,
  mockGreetingFirstName,
  mockHouseholdMembers,
  mockSubscriptionDossierViews,
  sortHouseholdMembers,
} from '../data/household-from-api'
import type { SubscriptionDossierView } from '../domain/subscription-dossier'
import {
  buildSubscriptionDossierView,
  findPendingSubscriptionContracts,
  sortSubscriptionDossiersByRecency,
  sortSubscriptionDossiersForSelection,
} from '../domain/subscription-dossier'
import type { Contract } from '../domain/types/mobility'

export interface HouseholdData {
  greetingFirstName: string
  members: HouseholdMemberView[]
  membersSource: DataSource
  dossiers: SubscriptionDossierView[]
  latestDossier: SubscriptionDossierView | null
  dossierSource: DataSource
  loading: boolean
  error: string | null
}

const MOCK_DOSSIERS = sortSubscriptionDossiersForSelection(mockSubscriptionDossierViews())
const MOCK_LATEST = sortSubscriptionDossiersByRecency(MOCK_DOSSIERS)[0] ?? null

const MOCK_RESULT: Omit<HouseholdData, 'loading' | 'error'> = {
  greetingFirstName: mockGreetingFirstName(),
  members: mockHouseholdMembers(),
  membersSource: 'mock',
  dossiers: MOCK_DOSSIERS,
  latestDossier: MOCK_LATEST,
  dossierSource: 'mock',
}

interface LoadedHousehold {
  greetingFirstName: string
  members: HouseholdMemberView[]
  membersSource: DataSource
  dossiers: SubscriptionDossierView[]
  latestDossier: SubscriptionDossierView | null
  dossierSource: DataSource
}

interface HouseholdCache {
  token: string
  data: LoadedHousehold | null
  error: string | null
}

export function useHouseholdData(): HouseholdData {
  const { token, user } = useAuth()
  const [cache, setCache] = useState<HouseholdCache | null>(null)

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

    Promise.all([mobilityApi.listMyIdentities(), contractsApi.list(token)])
      .then(async ([identities, subscriptionContracts]) => {
        if (cancelled) return

        const contractsByIdentity = new Map<string, Contract[]>()
        await Promise.all(
          identities.map(async (identity) => {
            try {
              const contracts = await mobilityApi.listContracts(identity.id)
              contractsByIdentity.set(identity.id, contracts)
            } catch {
              contractsByIdentity.set(identity.id, [])
            }
          }),
        )

        if (cancelled) return

        const membersFromApi =
          identities.length > 0
            ? sortHouseholdMembers(
                identities.map((identity) =>
                  mapIdentityToMember(
                    identity,
                    contractsByIdentity.get(identity.id) ?? [],
                  ),
                ),
              )
            : []

        const pendingContracts = findPendingSubscriptionContracts(
          subscriptionContracts,
        )

        const builtDossiers = await Promise.all(
          pendingContracts.map(async (contract) => {
            const uploads = await justificatifsApi
              .list(token, contract.id)
              .catch(() => [])
            return buildSubscriptionDossierView(contract, uploads)
          }),
        )

        if (cancelled) return

        const dossiers = sortSubscriptionDossiersForSelection(builtDossiers)
        const latestDossier =
          sortSubscriptionDossiersByRecency(builtDossiers)[0] ?? null

        const greetingFirstName =
          findOwnerFirstName(identities) ??
          greetingFromDisplayName(user?.displayName ?? null) ??
          mockGreetingFirstName()

        setCache({
          token,
          data: {
            greetingFirstName,
            members:
              membersFromApi.length > 0
                ? membersFromApi
                : mockHouseholdMembers(),
            membersSource: membersFromApi.length > 0 ? 'api' : 'mock',
            dossiers,
            latestDossier,
            dossierSource: dossiers.length > 0 ? 'api' : 'none',
          },
          error: null,
        })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setCache({
          token,
          data: null,
          error:
            err instanceof ApiError
              ? 'Impossible de charger votre foyer.'
              : 'Erreur de chargement.',
        })
      })

    return () => {
      cancelled = true
    }
  }, [token, user?.displayName])

  if (!token) {
    return { ...MOCK_RESULT, loading: false, error: null }
  }

  if (!cache || cache.token !== token) {
    return {
      greetingFirstName:
        greetingFromDisplayName(user?.displayName ?? null) ??
        mockGreetingFirstName(),
      members: mockHouseholdMembers(),
      membersSource: 'mock',
      dossiers: [],
      latestDossier: null,
      dossierSource: 'none',
      loading: true,
      error: null,
    }
  }

  if (cache.error) {
    return {
      ...MOCK_RESULT,
      greetingFirstName:
        greetingFromDisplayName(user?.displayName ?? null) ??
        mockGreetingFirstName(),
      dossiers: [],
      latestDossier: null,
      dossierSource: 'none',
      loading: false,
      error: cache.error,
    }
  }

  if (cache.data) {
    return { ...cache.data, loading: false, error: null }
  }

  return {
    greetingFirstName: mockGreetingFirstName(),
    members: mockHouseholdMembers(),
    membersSource: 'mock',
    dossiers: [],
    latestDossier: null,
    dossierSource: 'none',
    loading: false,
    error: null,
  }
}
