import { useEffect, useState } from 'react'
import { mobilityApi } from '../api/mobility-api'
import { ApiError } from '../api/http-client'
import { useAuth } from '../contexts/AuthContext'
import type {
  DataSource,
  PersonDetailSection,
  PersonDetailView,
} from '../data/household-from-api'
import {
  mapIdentityToPersonDetail,
  mockPersonDetailById,
} from '../data/household-from-api'
import type { Contract } from '../domain/types/mobility'

export interface PersonDetailData {
  person: PersonDetailView
  source: DataSource
  mockSections: PersonDetailSection[]
  loading: boolean
  error: string | null
}

const ALL_MOCK_SECTIONS: PersonDetailSection[] = [
  'profile',
  'roles',
  'titre',
  'ageBascule',
]

interface PersonDetailCache {
  key: string
  data: PersonDetailData
}

function withMockFallback(
  person: PersonDetailView,
  mockSections: PersonDetailSection[],
): PersonDetailView {
  const fallback = mockPersonDetailById(person.id)
  const patched = { ...person }

  if (mockSections.includes('titre') && !patched.titre && fallback.titre) {
    patched.titre = fallback.titre
  }
  if (mockSections.includes('ageBascule') && !patched.ageBascule && fallback.ageBascule) {
    patched.ageBascule = fallback.ageBascule
  }

  return patched
}

function buildMockResult(
  id: string | undefined,
  error: string | null = null,
): PersonDetailData {
  return {
    person: mockPersonDetailById(id),
    source: 'mock',
    mockSections: ALL_MOCK_SECTIONS,
    loading: false,
    error,
  }
}

async function loadContracts(identityId: string): Promise<Contract[]> {
  try {
    return await mobilityApi.listContracts(identityId)
  } catch {
    return []
  }
}

export function usePersonDetail(identityId: string | undefined): PersonDetailData {
  const { token } = useAuth()
  const [cache, setCache] = useState<PersonDetailCache | null>(null)

  const cacheKey = identityId && token ? `${token}:${identityId}` : null

  useEffect(() => {
    if (!cacheKey || !identityId || !token) {
      return
    }

    let cancelled = false

    mobilityApi
      .listMyIdentities()
      .then(async (identities) => {
        if (cancelled) return

        const identity = identities.find((item) => item.id === identityId)
        if (!identity) {
          setCache({
            key: cacheKey,
            data: buildMockResult(
              identityId,
              'Personne introuvable dans votre foyer. Affichage de démonstration.',
            ),
          })
          return
        }

        const contracts = await loadContracts(identityId)
        if (cancelled) return

        const person = mapIdentityToPersonDetail(identity, identities, contracts)
        const mockSections: PersonDetailSection[] = []

        if (!person.titre) {
          mockSections.push('titre')
        }

        setCache({
          key: cacheKey,
          data: {
            person: withMockFallback(person, mockSections),
            source: 'api',
            mockSections,
            loading: false,
            error: null,
          },
        })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setCache({
          key: cacheKey,
          data: buildMockResult(
            identityId,
            err instanceof ApiError
              ? 'Impossible de charger cette fiche. Affichage de démonstration.'
              : 'Erreur de chargement. Affichage de démonstration.',
          ),
        })
      })

    return () => {
      cancelled = true
    }
  }, [cacheKey, identityId, token])

  if (!identityId || !token) {
    return buildMockResult(identityId)
  }

  if (!cache || cache.key !== cacheKey) {
    return { ...buildMockResult(identityId), loading: true, error: null }
  }

  return cache.data
}
