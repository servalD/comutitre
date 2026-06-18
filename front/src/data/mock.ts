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
    role: 'Payeur' as const,
    status: 'Navigo Annuel actif',
    isSelf: true,
    character: 'marie' as CharacterId,
  },
  {
    id: '2',
    firstName: 'Léa',
    lastName: 'Dupont',
    age: 8,
    role: 'Junior' as const,
    status: 'Dossier en cours',
    isSelf: false,
    character: 'lea' as CharacterId,
  },
]

export const MOCK_DOSSIER = {
  product: 'Imagine R Junior',
  beneficiaryFirstName: 'Léa',
  beneficiaryFullName: 'Léa Dupont',
  beneficiaryCharacter: 'lea' as const,
  currentStep: 2,
  totalSteps: 5,
  steps: [
    { id: 1, label: 'Informations' },
    { id: 2, label: 'Justificatifs' },
    { id: 3, label: 'Vérification' },
    { id: 4, label: 'Paiement' },
    { id: 5, label: 'Validation' },
  ],
}

export const MOCK_DOSSIER_DETAIL = {
  product: 'Imagine R Junior',
  beneficiaryFullName: 'Léa Dupont',
  beneficiaryCharacter: 'lea' as const,
  currentStep: 2,
  totalSteps: 5,
  steps: [
    { id: 1, label: 'Identité' },
    { id: 2, label: 'Justificatifs' },
    { id: 3, label: 'Signature' },
    { id: 4, label: 'Paiement' },
    { id: 5, label: 'Validation' },
  ],
  justificatifs: [
    {
      id: 'id-card',
      label: "Pièce d'identité",
      status: 'success' as const,
      statusLabel: 'Déposé',
    },
    {
      id: 'school',
      label: 'Certificat de scolarité',
      status: 'success' as const,
      statusLabel: 'Déposé',
    },
    {
      id: 'photo',
      label: "Photo d'identité",
      status: 'success' as const,
      statusLabel: 'Déposée',
    },
  ],
  processingDelay: 'Délai de traitement : 5 à 10 jours ouvrés',
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
      features: [
        'Voyages illimités en Île-de-France',
        'Zones 1 à 5 incluses',
        'Renouvellement automatique',
      ],
      requiredDocuments: ["Pièce d'identité", 'Justificatif de domicile'],
      description: 'Pour les trajets quotidiens domicile-travail',
    },
    {
      id: 'imagine-r-junior' as const,
      label: 'Imagine R Junior',
      price: '384,00 € / an',
      priceMonthly: '32,00 € / mois',
      forBeneficiary: ['child'] as BeneficiaryChoice[],
      features: [
        'Adapté de 4 à 11 ans',
        'Trajets quotidiens scolaires',
        'Réduction jeune en Île-de-France',
      ],
      requiredDocuments: ["Pièce d'identité", 'Certificat de scolarité', "Photo d'identité"],
      description: 'Pour les jeunes enfants scolarisés',
    },
    {
      id: 'imagine-r-scolaire' as const,
      label: 'Imagine R Scolaire',
      price: '351,00 € / an',
      priceMonthly: '29,25 € / mois',
      forBeneficiary: ['child', 'other'] as BeneficiaryChoice[],
      features: [
        'Pour les collégiens et lycéens',
        'Valable en Île-de-France',
        'Année scolaire complète',
      ],
      requiredDocuments: ["Pièce d'identité", 'Certificat de scolarité', "Photo d'identité"],
      description: 'Adapté aux collégiens et lycéens scolarisés en Île-de-France',
    },
  ],
  beneficiaryOptions: [
    { id: 'self' as const, label: 'Moi-même' },
    { id: 'child' as const, label: 'Mon enfant' },
    { id: 'other' as const, label: 'Une autre personne' },
  ],
  beneficiaryForm: {
    firstName: 'Léa',
    lastName: 'Dupont',
    birthDate: '2018-03-15',
    email: 'marie.dupont@email.fr',
  },
  payment: {
    amount: '384,00 €',
    label: 'Imagine R Junior — année scolaire',
  },
}

export const MOCK_USAGE_OPTIONS = [
  {
    id: 'daily' as UsageOption,
    label: 'Quotidien',
    description: 'Allers-retours réguliers travail ou école',
    icon: 'metro',
  },
  {
    id: 'occasional' as UsageOption,
    label: 'Occasionnel',
    description: 'Quelques trajets par semaine',
    icon: 'calendar',
  },
  {
    id: 'pay-per-use' as UsageOption,
    label: 'À l\'usage',
    description: 'Payer à chaque trajet Liberté+',
    icon: 'ticket',
  },
]

export const MOCK_PERSON_LEA = {
  id: '2',
  firstName: 'Léa',
  lastName: 'Dupont',
  birthDate: '2018-03-15',
  age: 8,
  profile: 'Junior',
  character: 'lea' as CharacterId,
  roles: {
    porteur: { name: 'Léa', label: 'Léa' },
    payeur: { name: 'Marie Dupont', label: 'Marie Dupont', isSelf: true },
    responsableLegal: { name: 'Marie Dupont', isSelf: true },
  },
  ageBascule: 'Bascule Scolaire prévue à 11 ans',
  titre: {
    label: 'Imagine R Junior',
    validity: 'Valable en Île-de-France',
    status: 'Dossier en cours',
    statusType: 'pending' as const,
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
  { id: 'perte-vol', label: 'Perte ou vol de passe', icon: 'card' },
  { id: 'renouvellement', label: 'Renouvellement', icon: 'refresh' },
  { id: 'impaye', label: 'Impayé', icon: 'alert' },
  { id: 'imagine-r', label: 'Imagine R', icon: 'imaginer' },
  { id: 'tst', label: 'TST', icon: 'tst' },
  { id: 'contact-sav', label: 'Contact SAV', icon: 'headset' },
]

export const MOCK_HELP_PROBLEMS = [
  { id: 'broken-pass', label: 'Mon passe ne fonctionne plus' },
  { id: 'not-received', label: "Je n'ai pas reçu mon titre" },
  { id: 'refused-doc', label: 'Mon justificatif a été refusé' },
]

export const MOCK_VALIDATION_TIMELINE = [
  { id: 'sent', label: 'Dossier envoyé', date: "Aujourd'hui", done: true },
  { id: 'verify', label: 'Vérification documents', date: 'En cours', done: false, active: true },
  { id: 'activate', label: 'Activation titre', date: 'En attente', done: false },
]

export const DOSSIER_SUB_STEPS = [
  { id: 1, label: 'Justificatifs' },
  { id: 2, label: 'Signature' },
  { id: 3, label: 'Paiement' },
]
