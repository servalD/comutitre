import type { ProductType } from '../types/mobility'
import { calculateAge, deduceProfileFromBirthDate } from '../mobility/profile-calculator'
import {
  documentLabelsFor,
  productCatalog,
  scholarshipExtraDocument,
  travelHabitHelp,
} from './catalog'
import type {
  AdvisorStep,
  SocialRightLevel,
  SubscriptionAnswers,
  SubscriptionContext,
  SubscriptionQuestion,
  SubscriptionRecommendation,
} from './types'

const TARIFFS: Record<ProductType, { base: number; scholarship?: number }> = {
  imagine_r_junior: { base: 120 },
  imagine_r_scolaire: { base: 350, scholarship: 175 },
  imagine_r_etudiant: { base: 400, scholarship: 200 },
  navigo_annuel: { base: 900 },
  navigo_senior: { base: 650 },
  liberte_plus: { base: 0 },
  tst: { base: 0 },
  amethyste: { base: 0 },
}

const TST_TARIFF_HINT: Record<SocialRightLevel, string> = {
  gratuite: 'Gratuité transport',
  solidarite_75: 'Tarif solidarité −75 %',
  reduction_50: 'Réduction −50 %',
}

function buildContext(
  identityId: string,
  firstName: string,
  lastName: string,
  birthDate: string,
): SubscriptionContext {
  const age = calculateAge(birthDate) ?? 0
  const profile = deduceProfileFromBirthDate(birthDate) ?? 'adulte'
  return { identityId, firstName, lastName, birthDate, age, profile }
}

export function createSubscriptionContext(
  identity: Pick<SubscriptionContext, 'identityId' | 'firstName' | 'lastName' | 'birthDate'>,
): SubscriptionContext {
  return buildContext(
    identity.identityId,
    identity.firstName,
    identity.lastName,
    identity.birthDate,
  )
}

export function getAdvisorStep(
  context: SubscriptionContext,
  answers: SubscriptionAnswers,
): AdvisorStep {
  const questions: SubscriptionQuestion[] = []

  if (context.profile === 'junior') {
    // Pas de question métier : recommandation directe Imagine R Junior.
  } else if (context.profile === 'scolaire' || context.profile === 'etudiant') {
    if (answers.isEnrolled === undefined) {
      questions.push({
        id: 'is_enrolled',
        label:
          context.profile === 'scolaire'
            ? 'Cette personne est-elle scolarisée cette année ?'
            : 'Cette personne est-elle inscrite dans un établissement cette année ?',
        hint: 'Répondez pour l’année scolaire en cours.',
        options: [
          { value: 'yes', label: 'Oui' },
          { value: 'no', label: 'Non' },
        ],
      })
    } else if (answers.isEnrolled && answers.hasScholarship === undefined) {
      questions.push({
        id: 'has_scholarship',
        label: 'Bénéficie-t-elle d’une bourse (tarif réduit) ?',
        hint: 'Avec une bourse, vous pourrez bénéficier d’un tarif réduit sur présentation d’une attestation.',
        options: [
          { value: 'yes', label: 'Oui, boursier(ère)' },
          { value: 'no', label: 'Non, tarif plein' },
        ],
      })
    }
  } else if (context.profile === 'senior' || context.profile === 'adulte') {
    if (answers.travelHabit === undefined) {
      questions.push({
        id: 'travel_habit',
        label: 'Comment cette personne utilise-t-elle les transports ?',
        options: [
          {
            value: 'daily',
            label: 'Tous les jours ou presque',
            description: travelHabitHelp.daily.body,
          },
          {
            value: 'occasional',
            label: 'De temps en temps',
            description: travelHabitHelp.occasional.body,
          },
          {
            value: 'social_rights',
            label: 'J’ai des droits sociaux (TST)',
            description: travelHabitHelp.social_rights.body,
          },
          {
            value: 'department_assigned',
            label: 'Droit Améthyste (département)',
            description: travelHabitHelp.department_assigned.body,
          },
        ],
      })
    } else if (
      answers.travelHabit === 'social_rights' &&
      answers.socialRightLevel === undefined
    ) {
      questions.push({
        id: 'social_right_level',
        label: 'Quel niveau de Tarification Solidarité Transport ?',
        hint: 'Selon votre situation : RSA, CAF, France Travail, MDPH…',
        options: [
          { value: 'gratuite', label: 'Gratuité' },
          { value: 'solidarite_75', label: 'Solidarité −75 %' },
          { value: 'reduction_50', label: 'Réduction −50 %' },
        ],
      })
    }
  } else if (context.profile === 'tst' || context.profile === 'amethyste') {
    if (answers.travelHabit === undefined) {
      questions.push({
        id: 'travel_habit',
        label: 'Souhaitez-vous renouveler ou modifier votre droit ?',
        options: [
          { value: 'social_rights', label: 'Renouveler ma TST' },
          { value: 'daily', label: 'Passer au forfait annuel (plein tarif)' },
          { value: 'occasional', label: 'Passer à Liberté+ (à l’usage)' },
        ],
      })
    } else if (
      answers.travelHabit === 'social_rights' &&
      answers.socialRightLevel === undefined
    ) {
      questions.push({
        id: 'social_right_level',
        label: 'Quel niveau de TST ?',
        options: [
          { value: 'gratuite', label: 'Gratuité' },
          { value: 'solidarite_75', label: 'Solidarité −75 %' },
          { value: 'reduction_50', label: 'Réduction −50 %' },
        ],
      })
    }
  }

  if (questions.length === 0 && answers.hasNavigoCard === undefined) {
    const product = peekProduct(context, answers)
    if (product && product !== 'liberte_plus') {
      questions.push({
        id: 'has_navigo_card',
        label: 'Avez-vous déjà une carte Navigo personnalisée ?',
        hint: 'C’est le support sur lequel votre forfait sera enregistré. Si vous n’en avez pas, nous vous guiderons pour en commander une.',
        options: [
          { value: 'yes', label: 'Oui, j’en ai déjà une' },
          { value: 'no', label: 'Non, je dois en commander une' },
        ],
      })
    }
  }

  const canRecommend =
    questions.length === 0 && peekProduct(context, answers) !== null

  return { questions, canRecommend }
}

function peekProduct(
  context: SubscriptionContext,
  answers: SubscriptionAnswers,
): ProductType | null {
  try {
    return buildRecommendation(context, answers).productType
  } catch {
    return null
  }
}

export function buildRecommendation(
  context: SubscriptionContext,
  answers: SubscriptionAnswers,
): SubscriptionRecommendation {
  const { profile, age } = context

  if (age < 4) {
    throw new Error('L’enregistrement est possible à partir de 4 ans.')
  }

  if (profile === 'junior') {
    return recommend('imagine_r_junior', [
      `Âge ${age} ans : éligible Imagine R Junior.`,
      'Le payeur et représentant légal gère la souscription.',
    ])
  }

  if (profile === 'scolaire') {
    if (!answers.isEnrolled) {
      throw new Error('Sans scolarité, Imagine R Scolaire n’est pas adapté.')
    }
    const product: ProductType = 'imagine_r_scolaire'
    const withScholarship = Boolean(answers.hasScholarship)
    return recommend(
      product,
      [
        `Âge ${age} ans : profil scolaire.`,
        withScholarship
          ? 'Tarif boursier : attestation de bourse requise.'
          : 'Tarif plein : certificat scolaire requis.',
      ],
      withScholarship,
    )
  }

  if (profile === 'etudiant') {
    if (!answers.isEnrolled) {
      throw new Error('Imagine R Étudiant nécessite une inscription en cours.')
    }
    const withScholarship = Boolean(answers.hasScholarship)
    return recommend(
      'imagine_r_etudiant',
      [
        `Âge ${age} ans : profil étudiant.`,
        withScholarship
          ? 'Réduction bourse applicable avec justificatif.'
          : 'Certificat de scolarité ou étudiant requis.',
      ],
      withScholarship,
    )
  }

  if (profile === 'senior') {
    return resolveAdultSeniorRecommendation(context, answers, true)
  }

  if (profile === 'adulte') {
    return resolveAdultSeniorRecommendation(context, answers, false)
  }

  if (profile === 'tst' || profile === 'amethyste') {
    return resolveAdultSeniorRecommendation(context, answers, profile === 'tst')
  }

  throw new Error('Profil non pris en charge.')
}

function resolveAdultSeniorRecommendation(
  context: SubscriptionContext,
  answers: SubscriptionAnswers,
  preferSenior: boolean,
): SubscriptionRecommendation {
  const habit = answers.travelHabit
  if (!habit) throw new Error('Répondez aux questions pour continuer.')

  if (habit === 'daily') {
    const product: ProductType = preferSenior ? 'navigo_senior' : 'navigo_annuel'
    return recommend(product, [
      'Trajets fréquents : un forfait annuel est le plus économique sur 12 mois.',
      preferSenior
        ? `Âge ${context.age} ans : tarif senior applicable.`
        : 'Couverture toutes zones, renouvellement automatique.',
    ])
  }

  if (habit === 'occasional') {
    return recommend(
      'liberte_plus',
      [
        'Trajets occasionnels : pas besoin d’un abonnement à l’année.',
        'Chaque validation est facturée ; prélèvement mensuel SEPA.',
      ],
      false,
      'Existent aussi Navigo Mois et Navigo Semaine pour des besoins courts — non gérés dans cette démo.',
    )
  }

  if (habit === 'social_rights') {
    const level = answers.socialRightLevel
    if (!level) throw new Error('Précisez votre niveau TST.')
    return recommend(
      'tst',
      [
        'Éligibilité Tarification Solidarité Transport.',
        TST_TARIFF_HINT[level],
        'Droit renouvelé par périodes de 3 mois.',
      ],
      false,
      TST_TARIFF_HINT[level],
    )
  }

  if (habit === 'department_assigned') {
    return recommend('amethyste', [
      'Forfait Améthyste : attribué par le département.',
      'Vérification de l’attribution avant activation.',
    ])
  }

  throw new Error('Situation non reconnue.')
}

function recommend(
  productType: ProductType,
  why: string[],
  withScholarship = false,
  tariffOverride?: string,
): SubscriptionRecommendation {
  const catalog = productCatalog[productType]
  const tariffs = TARIFFS[productType]
  const documents = [...catalog.documents]
  if (withScholarship && productType.startsWith('imagine_r')) {
    documents.push(scholarshipExtraDocument)
  }

  const estimatedTariff = withScholarship
    ? (tariffs.scholarship ?? tariffs.base)
    : tariffs.base

  let tariffLabel: string
  if (tariffOverride) {
    tariffLabel = tariffOverride
  } else if (productType === 'liberte_plus') {
    tariffLabel = 'Facturation à l’usage (pas de forfait fixe)'
  } else if (productType === 'tst') {
    tariffLabel = 'Selon droit social vérifié'
  } else if (productType === 'amethyste') {
    tariffLabel = 'Selon attribution départementale'
  } else {
    tariffLabel = `${estimatedTariff.toFixed(0)} € / an`
  }

  const alternatives = buildAlternatives(productType)

  return {
    productType,
    productLabel: catalog.label,
    summary: catalog.shortDescription,
    why,
    estimatedTariff,
    tariffLabel,
    requiredDocuments: documents,
    documentLabels: documentLabelsFor(documents),
    alternatives,
  }
}

function buildAlternatives(
  productType: ProductType,
): SubscriptionRecommendation['alternatives'] {
  if (productType === 'navigo_annuel') {
    return [
      {
        productLabel: productCatalog.liberte_plus.label,
        reason: 'Si vos trajets deviennent plus rares, sans engagement annuel.',
      },
    ]
  }
  if (productType === 'liberte_plus') {
    return [
      {
        productLabel: productCatalog.navigo_annuel.label,
        reason: 'Si vous voyagez quasi quotidiennement, l’annuel est plus avantageux.',
      },
    ]
  }
  if (productType === 'imagine_r_scolaire') {
    return []
  }
  return undefined
}

export function getSchoolYearContractDates(): { validFrom: string; validTo: string } {
  const now = new Date()
  const year = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1
  const validFrom = new Date(Date.UTC(year, 8, 1))
  const validTo = new Date(Date.UTC(year + 1, 7, 31, 23, 59, 59))
  return { validFrom: validFrom.toISOString(), validTo: validTo.toISOString() }
}

export function getAnnualContractDates(): { validFrom: string; validTo: string } {
  const now = new Date()
  const validFrom = new Date(now)
  const validTo = new Date(now)
  validTo.setFullYear(validTo.getFullYear() + 1)
  return { validFrom: validFrom.toISOString(), validTo: validTo.toISOString() }
}

export function getTstContractDates(): { validFrom: string; validTo: string } {
  const now = new Date()
  const validTo = new Date(now)
  validTo.setMonth(validTo.getMonth() + 3)
  return { validFrom: now.toISOString(), validTo: validTo.toISOString() }
}

export function contractDatesForProduct(
  productType: ProductType,
): { validFrom: string; validTo: string } {
  if (productType.startsWith('imagine_r')) return getSchoolYearContractDates()
  if (productType === 'tst') return getTstContractDates()
  return getAnnualContractDates()
}
