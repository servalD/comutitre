import type { DocumentType, ProductType } from '../types/mobility'
import i18n from '../../i18n'
import { labelFor } from '../../constants/labels'

export interface ProductCatalogEntry {
  label: string
  shortDescription: string
  typicalDuration: string
  documents: DocumentType[]
}

const ct = (key: string): string => i18n.t(`catalog.${key}`, { ns: 'mobility' })

function entry(
  productType: ProductType,
  documents: DocumentType[],
): ProductCatalogEntry {
  return {
    get label() {
      return labelFor.product(productType)
    },
    get shortDescription() {
      return ct(`${productType}.desc`)
    },
    get typicalDuration() {
      return ct(`${productType}.duration`)
    },
    documents,
  }
}

export const productCatalog: Record<ProductType, ProductCatalogEntry> = {
  imagine_r_junior: entry('imagine_r_junior', [
    'identity_document',
    'photo',
    'school_certificate',
  ]),
  imagine_r_scolaire: entry('imagine_r_scolaire', [
    'identity_document',
    'photo',
    'school_certificate',
  ]),
  imagine_r_etudiant: entry('imagine_r_etudiant', [
    'identity_document',
    'photo',
    'student_certificate',
  ]),
  navigo_annuel: entry('navigo_annuel', [
    'identity_document',
    'photo',
    'address_proof',
    'payment_mandate',
  ]),
  navigo_senior: entry('navigo_senior', ['identity_document', 'photo']),
  liberte_plus: entry('liberte_plus', ['identity_document', 'payment_mandate']),
  tst: entry('tst', ['identity_document', 'social_right', 'address_proof']),
  amethyste: entry('amethyste', ['identity_document', 'address_proof']),
}

export const scholarshipExtraDocument: DocumentType = 'scholarship_certificate'

export const travelHabitHelp = {
  daily: {
    get title() {
      return ct('habit.daily.title')
    },
    get body() {
      return ct('habit.daily.body')
    },
  },
  occasional: {
    get title() {
      return ct('habit.occasional.title')
    },
    get body() {
      return ct('habit.occasional.body')
    },
  },
  social_rights: {
    get title() {
      return ct('habit.social_rights.title')
    },
    get body() {
      return ct('habit.social_rights.body')
    },
  },
  department_assigned: {
    get title() {
      return ct('habit.department_assigned.title')
    },
    get body() {
      return ct('habit.department_assigned.body')
    },
  },
}

export function documentLabelsFor(types: DocumentType[]): string[] {
  return types.map((type) => labelFor.documentType(type))
}
