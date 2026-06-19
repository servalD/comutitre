import type { CreateContractPayload } from '../../api/contracts'
import type { UsageOption } from '../../data/mock'
import type { SubscriptionBeneficiaryView } from '../../data/household-from-api'
import type { DocumentType, ProductType } from '../types/mobility'
import type { SubscriptionRecommendation, TravelHabit } from './types'

const PRODUCT_TO_CONTRACT_CODE: Record<ProductType, string> = {
  imagine_r_junior: 'imagine_r_junior',
  imagine_r_scolaire: 'imagine_r_scolaire',
  imagine_r_etudiant: 'imagine_r_etudiant',
  navigo_annuel: 'navigo_annuel',
  navigo_senior: 'navigo_annuel_senior',
  liberte_plus: 'navigo_liberte_plus',
  tst: 'tst',
  amethyste: 'amethyste',
}

export function mapProductTypeToContractCode(productType: ProductType): string {
  return PRODUCT_TO_CONTRACT_CODE[productType]
}

const CONTRACT_CODE_TO_PRODUCT: Record<string, ProductType> = {
  imagine_r_junior: 'imagine_r_junior',
  imagine_r_scolaire: 'imagine_r_scolaire',
  imagine_r_etudiant: 'imagine_r_etudiant',
  navigo_annuel: 'navigo_annuel',
  navigo_annuel_senior: 'navigo_senior',
  navigo_liberte_plus: 'liberte_plus',
  tst: 'tst',
  amethyste: 'amethyste',
}

export function contractCodeToProductType(code: string): ProductType | undefined {
  return CONTRACT_CODE_TO_PRODUCT[code]
}

export function usageToTravelHabit(usage: UsageOption): TravelHabit {
  if (usage === 'daily') return 'daily'
  if (usage === 'pay-per-use') return 'occasional'
  return 'occasional'
}

export const DOCUMENT_TO_JUSTIFICATIF: Partial<Record<DocumentType, string>> = {
  identity_document: 'piece_identite',
  school_certificate: 'certificat_scolarite',
  student_certificate: 'certificat_scolarite',
  scholarship_certificate: 'attestation_bourse',
  photo: 'photo',
  address_proof: 'justificatif_domicile',
  payment_mandate: 'mandat_sepa',
  social_right: 'attestation_caf',
}

export function buildCreateContractPayload(params: {
  recommendation: SubscriptionRecommendation
  beneficiary: Pick<
    SubscriptionBeneficiaryView,
    'firstName' | 'lastName' | 'age' | 'isSelf'
  >
  ownerEmail: string
  ownerFirstName: string
  ownerLastName: string
}): CreateContractPayload {
  const isMinor = params.beneficiary.age < 18

  return {
    productCode: mapProductTypeToContractCode(params.recommendation.productType),
    holderFirstName: params.beneficiary.firstName,
    holderLastName: params.beneficiary.lastName,
    holderEmail: params.ownerEmail,
    payerFirstName: params.ownerFirstName,
    payerLastName: params.ownerLastName,
    payerEmail: params.ownerEmail,
    legalRepEmail: isMinor ? params.ownerEmail : undefined,
  }
}
