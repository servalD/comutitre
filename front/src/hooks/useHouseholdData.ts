import { useEffect, useState } from 'react'
import { mobilityApi } from '../api/mobility-api'
import { ApiError } from '../api/http-client'
import { useAuth } from '../contexts/AuthContext'
import type {
  DataSource,
  DossierView,
  HouseholdMemberView,
} from '../data/household-from-api'
import {
  buildDossierFromContracts,
  findOwnerFirstName,
  greetingFromDisplayName,
  mapIdentityToMember,
  mockDossierView,
  mockGreetingFirstName,
  mockHouseholdMembers,
  sortHouseholdMembers,
} from '../data/household-from-api'
import type { Contract } from '../domain/types/mobility'

export interface HouseholdData {
  greetingFirstName: string
  members: HouseholdMemberView[]
  membersSource: DataSource
  dossier: DossierView
  dossierSource: DataSource
  loading: boolean
  error: string | null
}

const MOCK_RESULT: Omit<HouseholdData, 'loading' | 'error'> = {
  greetingFirstName: mockGreetingFirstName(),
  members: mockHouseholdMembers(),
  membersSource: 'mock',
  dossier: mockDossierView(),
  dossierSource: 'mock',
}

interface LoadedHousehold {
  greetingFirstName: string
  members: HouseholdMemberView[]
  membersSource: DataSource
  dossier: DossierView
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

    mobilityApi
      .listMyIdentities()
      .then(async (identities) => {
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

        const dossierFromApi = buildDossierFromContracts(
          identities,
          contractsByIdentity,
        )

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
            dossier: dossierFromApi ?? mockDossierView(),
            dossierSource: dossierFromApi ? 'api' : 'mock',
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
    return { ...MOCK_RESULT, loading: true, error: null }
  }

  if (cache.error) {
    return {
      ...MOCK_RESULT,
      greetingFirstName:
        greetingFromDisplayName(user?.displayName ?? null) ??
        mockGreetingFirstName(),
      loading: false,
      error: cache.error,
    }
  }

  if (cache.data) {
    return { ...cache.data, loading: false, error: null }
  }

  return { ...MOCK_RESULT, loading: false, error: null }
}
