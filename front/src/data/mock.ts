import i18n from '../i18n'

const m = (key: string): string => i18n.t(`mock.${key}`, { ns: 'foyer' })

export type CharacterId = 'marie' | 'lea'

export const MOCK_USER = {
  firstName: 'Marie',
  lastName: 'Dupont',
  character: 'marie' as CharacterId,
}

export const MOCK_HOUSEHOLD = [
  {
    id: '1',
    firstName: 'Marie',
    lastName: 'Dupont',
    age: 34,
    get role() {
      return m('household.marie.role')
    },
    get status() {
      return m('household.marie.status')
    },
    isSelf: true,
    character: 'marie' as CharacterId,
  },
  {
    id: '2',
    firstName: 'Jules',
    lastName: 'Dupont',
    age: 17,
    get role() {
      return m('household.lea.role')
    },
    get status() {
      return m('household.lea.status')
    },
    isSelf: false,
    character: 'lea' as CharacterId,
  },
]

export const MOCK_DOSSIER = {
  product: 'Imagine R Scolaire',
  beneficiaryFirstName: 'Jules',
  beneficiaryFullName: 'Jules Dupont',
  beneficiaryCharacter: 'lea' as const,
  currentStep: 2,
  totalSteps: 5,
  get steps() {
    return [
      { id: 1, label: m('dossierSteps.informations') },
      { id: 2, label: m('dossierSteps.justificatifs') },
      { id: 3, label: m('dossierSteps.verification') },
      { id: 4, label: m('dossierSteps.paiement') },
      { id: 5, label: m('dossierSteps.validation') },
    ]
  },
}

export const MOCK_DOSSIER_MARIE = {
  product: 'Navigo Annuel',
  beneficiaryFirstName: 'Marie',
  beneficiaryFullName: 'Marie Dupont',
  beneficiaryCharacter: 'marie' as const,
  currentStep: 4,
  totalSteps: 5,
  status: 'en_attente_de_signature_payeur' as const,
  statusLabel: 'Signature payeur',
  documentsDeposed: 3,
  documentsRequired: 3,
}

export const MOCK_DOSSIER_DETAIL = {
  product: 'Imagine R Scolaire',
  beneficiaryFullName: 'Jules Dupont',
  beneficiaryCharacter: 'lea' as const,
  currentStep: 2,
  totalSteps: 5,
  get steps() {
    return [
      { id: 1, label: m('dossierDetailSteps.identite') },
      { id: 2, label: m('dossierDetailSteps.justificatifs') },
      { id: 3, label: m('dossierDetailSteps.signature') },
      { id: 4, label: m('dossierDetailSteps.paiement') },
      { id: 5, label: m('dossierDetailSteps.validation') },
    ]
  },
  get justificatifs() {
    return [
      {
        id: 'id-card',
        label: m('dossierDocs.idCard'),
        status: 'success' as const,
        statusLabel: m('dossierDocs.uploaded'),
      },
      {
        id: 'school',
        label: m('dossierDocs.school'),
        status: 'success' as const,
        statusLabel: m('dossierDocs.uploaded'),
      },
      {
        id: 'photo',
        label: m('dossierDocs.photo'),
        status: 'success' as const,
        statusLabel: m('dossierDocs.uploadedFem'),
      },
    ]
  },
  get processingDelay() {
    return m('processingDelay')
  },
}

export type BeneficiaryChoice = 'self' | 'child' | 'other'

export type SubscriptionProductId =
  | 'navigo-annuel'
  | 'imagine-r-junior'
  | 'imagine-r-scolaire'

export type PaymentMethod = 'card' | 'direct-debit'

export type UsageOption = 'daily' | 'occasional' | 'pay-per-use'

export const MOCK_SUBSCRIPTION = {
  totalSteps: 5,
  products: [
    {
      id: 'navigo-annuel' as const,
      label: 'Navigo Annuel',
      price: '894,40 € / an',
      priceMonthly: '74,53 € / mois',
      forBeneficiary: ['self'] as BeneficiaryChoice[],
      get features() {
        return [
          m('products.navigo.feature1'),
          m('products.navigo.feature2'),
          m('products.navigo.feature3'),
        ]
      },
      get requiredDocuments() {
        return [m('docs.idCard'), m('docs.addressProof')]
      },
      get description() {
        return m('products.navigo.description')
      },
    },
    {
      id: 'imagine-r-junior' as const,
      label: 'Imagine R Junior',
      price: '384,00 € / an',
      priceMonthly: '32,00 € / mois',
      forBeneficiary: ['child'] as BeneficiaryChoice[],
      get features() {
        return [
          m('products.junior.feature1'),
          m('products.junior.feature2'),
          m('products.junior.feature3'),
        ]
      },
      get requiredDocuments() {
        return [m('docs.idCard'), m('docs.schoolCertificate'), m('docs.idPhoto')]
      },
      get description() {
        return m('products.junior.description')
      },
    },
    {
      id: 'imagine-r-scolaire' as const,
      label: 'Imagine R Scolaire',
      price: '351,00 € / an',
      priceMonthly: '29,25 € / mois',
      forBeneficiary: ['child', 'other'] as BeneficiaryChoice[],
      get features() {
        return [
          m('products.scolaire.feature1'),
          m('products.scolaire.feature2'),
          m('products.scolaire.feature3'),
        ]
      },
      get requiredDocuments() {
        return [m('docs.idCard'), m('docs.schoolCertificate'), m('docs.idPhoto')]
      },
      get description() {
        return m('products.scolaire.description')
      },
    },
  ],
  beneficiaryOptions: [
    {
      id: 'self' as const,
      get label() {
        return m('beneficiaryOptions.self')
      },
    },
    {
      id: 'child' as const,
      get label() {
        return m('beneficiaryOptions.child')
      },
    },
    {
      id: 'other' as const,
      get label() {
        return m('beneficiaryOptions.other')
      },
    },
  ],
  beneficiaryForm: {
    firstName: 'Jules',
    lastName: 'Dupont',
    birthDate: '2009-06-12',
    email: 'marie.dupont@email.fr',
  },
  payment: {
    amount: '351,00 €',
    get label() {
      return m('payment.label')
    },
  },
}

export const MOCK_USAGE_OPTIONS = [
  {
    id: 'daily' as UsageOption,
    get label() {
      return m('usage.daily.label')
    },
    get description() {
      return m('usage.daily.description')
    },
    icon: 'metro',
  },
  {
    id: 'occasional' as UsageOption,
    get label() {
      return m('usage.occasional.label')
    },
    get description() {
      return m('usage.occasional.description')
    },
    icon: 'calendar',
  },
  {
    id: 'pay-per-use' as UsageOption,
    get label() {
      return m('usage.payPerUse.label')
    },
    get description() {
      return m('usage.payPerUse.description')
    },
    icon: 'ticket',
  },
]

export { MOCK_PERSON_JULES } from './person-detail-mock'

/** @deprecated Utiliser MOCK_PERSON_JULES — conservé pour compatibilité */
export const MOCK_PERSON_LEA = {
  id: '2',
  firstName: 'Jules',
  lastName: 'Dupont',
  birthDate: '2009-06-12',
  age: 17,
  profile: 'Scolaire',
  character: 'lea' as CharacterId,
  roles: {
    porteur: { name: 'Jules', label: 'Jules' },
    payeur: { name: 'Marie Dupont', label: 'Marie Dupont', isSelf: false },
    responsableLegal: { name: 'Marie Dupont', isSelf: false },
  },
  ageBascule: 'Compte Connect récupérable — passation disponible',
  titre: {
    label: 'Imagine R Scolaire',
    validity: 'Valable en Île-de-France',
    status: 'Imagine R Scolaire actif',
    statusType: 'active' as const,
    productType: 'imagine_r_scolaire' as const,
  },
}

export const MOCK_PERSON_MARIE = {
  id: '1',
  firstName: 'Marie',
  lastName: 'Dupont',
  birthDate: '1991-03-15',
  age: 34,
  profile: 'Adulte',
  character: 'marie' as CharacterId,
  roles: {
    porteur: { name: 'Marie', label: 'Marie' },
    payeur: { name: 'Marie Dupont', label: 'Marie Dupont', isSelf: true },
    responsableLegal: { name: 'Marie Dupont', isSelf: true },
  },
  ageBascule: null as string | null,
  titre: {
    label: 'Navigo Annuel',
    validity: 'Valable en Île-de-France',
    status: 'Navigo Annuel actif',
    statusType: 'active' as const,
    productType: 'navigo_annuel' as const,
  },
}

export type HelpCategoryId =
  | 'perte-vol'
  | 'renouvellement'
  | 'impaye'
  | 'imagine-r'
  | 'tst'
  | 'contact-sav'

export const MOCK_HELP_CATEGORIES: Array<{
  id: HelpCategoryId
  label: string
  icon: string
}> = [
  { id: 'perte-vol', get label() { return m('help.perteVol') }, icon: 'card' },
  { id: 'renouvellement', get label() { return m('help.renouvellement') }, icon: 'refresh' },
  { id: 'impaye', get label() { return m('help.impaye') }, icon: 'alert' },
  { id: 'imagine-r', get label() { return m('help.imagineR') }, icon: 'imaginer' },
  { id: 'tst', get label() { return m('help.tst') }, icon: 'tst' },
  { id: 'contact-sav', get label() { return m('help.contactSav') }, icon: 'headset' },
]

export const MOCK_HELP_PROBLEMS = [
  { id: 'broken-pass', get label() { return m('problems.brokenPass') } },
  { id: 'not-received', get label() { return m('problems.notReceived') } },
  { id: 'refused-doc', get label() { return m('problems.refusedDoc') } },
]

export const MOCK_VALIDATION_TIMELINE = [
  { id: 'sent', get label() { return m('timeline.sent.label') }, get date() { return m('timeline.sent.date') }, done: true },
  { id: 'verify', get label() { return m('timeline.verify.label') }, get date() { return m('timeline.verify.date') }, done: false, active: true },
  { id: 'activate', get label() { return m('timeline.activate.label') }, get date() { return m('timeline.activate.date') }, done: false },
]

export const DOSSIER_SUB_STEPS = [
  { id: 1, get label() { return m('subSteps.justificatifs') } },
  { id: 2, get label() { return m('subSteps.signature') } },
  { id: 3, get label() { return m('subSteps.paiement') } },
]
