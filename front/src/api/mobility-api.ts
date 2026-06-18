import { HttpClient } from './http-client'
import { tokenStorage } from '../auth/token-storage'
import type {
  CloseFoundSupportPayload,
  Contract,
  CreateContractPayload,
  DeclareFoundSupportPayload,
  CreateDocumentPayload,
  CreateMobilityIdentityPayload,
  CreateRelationshipPayload,
  CreateSupportPayload,
  Document,
  FoundSupportCase,
  FoundSupportClosure,
  MobilityIdentity,
  MobilityIdentityWithRelationships,
  Support,
  TimelineEvent,
  UpdateMobilityIdentityPayload,
  Relationship,
} from '../domain/types/mobility'

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

const http = new HttpClient({
  baseUrl,
  getAccessToken: () => tokenStorage.get(),
})

export const mobilityApi = {
  listMyIdentities(): Promise<MobilityIdentityWithRelationships[]> {
    return http.get('/users/me/identities')
  },

  getIdentity(id: string): Promise<MobilityIdentity> {
    return http.get(`/mobility-identities/${id}`)
  },

  createIdentity(
    payload: CreateMobilityIdentityPayload,
  ): Promise<MobilityIdentity> {
    return http.post('/mobility-identities', payload)
  },

  updateIdentity(
    id: string,
    payload: UpdateMobilityIdentityPayload,
  ): Promise<MobilityIdentity> {
    return http.patch(`/mobility-identities/${id}`, payload)
  },

  createRelationship(
    payload: CreateRelationshipPayload,
  ): Promise<Relationship> {
    return http.post('/relationships', payload)
  },

  revokeRelationship(id: string): Promise<Relationship> {
    return http.post(`/relationships/${id}/revoke`)
  },

  listContracts(identityId: string): Promise<Contract[]> {
    return http.get(`/mobility-identities/${identityId}/contracts`)
  },

  createContract(
    identityId: string,
    payload: CreateContractPayload,
  ): Promise<Contract> {
    return http.post(`/mobility-identities/${identityId}/contracts`, payload)
  },

  listDocuments(identityId: string): Promise<Document[]> {
    return http.get(`/mobility-identities/${identityId}/documents`)
  },

  createDocument(
    identityId: string,
    payload: CreateDocumentPayload,
  ): Promise<Document> {
    return http.post(`/mobility-identities/${identityId}/documents`, payload)
  },

  listSupports(identityId: string): Promise<Support[]> {
    return http.get(`/mobility-identities/${identityId}/supports`)
  },

  createSupport(
    identityId: string,
    payload: CreateSupportPayload,
  ): Promise<Support> {
    return http.post(`/mobility-identities/${identityId}/supports`, payload)
  },

  getTimeline(identityId: string): Promise<TimelineEvent[]> {
    return http.get(`/mobility-identities/${identityId}/timeline`)
  },

  declareFoundSupport(
    payload: DeclareFoundSupportPayload,
  ): Promise<FoundSupportCase> {
    return http.post('/support-found-cases', payload)
  },

  closeFoundSupportCase(
    id: string,
    payload: CloseFoundSupportPayload,
  ): Promise<FoundSupportClosure> {
    return http.patch(`/support-found-cases/${id}/close`, payload)
  },
}

export function getFranceConnectLoginUrl(): string {
  return `${baseUrl}/auth/franceconnect/login`
}
