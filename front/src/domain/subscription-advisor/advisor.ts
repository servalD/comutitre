import type { ProductType } from '../types/mobility'
import i18n from '../../i18n'
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

const at = (key: string, options?: Record<string, unknown>): string =>
  i18n.t(`advisor.${key}`, { ns: 'mobility', ...options })

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

const tstTariffHint = (level: SocialRightLevel): string => at(`tstTariffHint.${level}`)

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
            ? at('q.isEnrolled.labelScolaire')
            : at('q.isEnrolled.labelEtudiant'),
        hint: at('q.isEnrolled.hint'),
        options: [
          { value: 'yes', label: at('common.yes') },
          { value: 'no', label: at('common.no') },
        ],
      })
    } else if (answers.isEnrolled && answers.hasScholarship === undefined) {
      questions.push({
        id: 'has_scholarship',
        label: at('q.scholarship.label'),
        hint: at('q.scholarship.hint'),
        options: [
          { value: 'yes', label: at('q.scholarship.yes') },
          { value: 'no', label: at('q.scholarship.no') },
        ],
      })
    }
  } else if (context.profile === 'senior' || context.profile === 'adulte') {
    if (answers.travelHabit === undefined) {
      questions.push({
        id: 'travel_habit',
        label: at('q.travelHabit.label'),
        options: [
          {
            value: 'daily',
            label: at('q.travelHabit.daily'),
            description: travelHabitHelp.daily.body,
          },
          {
            value: 'occasional',
            label: at('q.travelHabit.occasional'),
            description: travelHabitHelp.occasional.body,
          },
          {
            value: 'social_rights',
            label: at('q.travelHabit.socialRights'),
            description: travelHabitHelp.social_rights.body,
          },
          {
            value: 'department_assigned',
            label: at('q.travelHabit.departmentAssigned'),
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
        label: at('q.socialLevel.label'),
        hint: at('q.socialLevel.hint'),
        options: [
          { value: 'gratuite', label: at('q.socialLevel.gratuite') },
          { value: 'solidarite_75', label: at('q.socialLevel.solidarite75') },
          { value: 'reduction_50', label: at('q.socialLevel.reduction50') },
        ],
      })
    }
  } else if (context.profile === 'tst' || context.profile === 'amethyste') {
    if (answers.travelHabit === undefined) {
      questions.push({
        id: 'travel_habit',
        label: at('q.travelHabitTst.label'),
        options: [
          { value: 'social_rights', label: at('q.travelHabitTst.renew') },
          { value: 'daily', label: at('q.travelHabitTst.annual') },
          { value: 'occasional', label: at('q.travelHabitTst.liberte') },
        ],
      })
    } else if (
      answers.travelHabit === 'social_rights' &&
      answers.socialRightLevel === undefined
    ) {
      questions.push({
        id: 'social_right_level',
        label: at('q.socialLevelTst.label'),
        options: [
          { value: 'gratuite', label: at('q.socialLevel.gratuite') },
          { value: 'solidarite_75', label: at('q.socialLevel.solidarite75') },
          { value: 'reduction_50', label: at('q.socialLevel.reduction50') },
        ],
      })
    }
  }

  if (questions.length === 0 && answers.travelHabit === 'occasional') {
    if (answers.liberteSupport === undefined) {
      questions.push({
        id: 'liberte_support',
        label: at('q.liberteSupport.label'),
        options: [
          {
            value: 'passe',
            label: at('q.liberteSupport.passe'),
            description: at('q.liberteSupport.passeDesc'),
          },
          {
            value: 'telephone',
            label: at('q.liberteSupport.telephone'),
            description: at('q.liberteSupport.telephoneDesc'),
            disabled: true,
            disabledReason: at('q.liberteSupport.telephoneUnavailable'),
          },
        ],
      })
    } else if (answers.liberteSupport === 'telephone') {
      return {
        questions: [],
        canRecommend: false,
        isBlocked: true,
        blockMessage: at('q.liberteSupport.telephoneBlock'),
      }
    }
  }

  if (questions.length === 0 && answers.hasNavigoCard === undefined) {
    const product = peekProduct(context, answers)
    if (product && (product !== 'liberte_plus' || answers.liberteSupport === 'passe')) {
      questions.push({
        id: 'has_navigo_card',
        label: at('q.navigoCard.label'),
        hint: at('q.navigoCard.hint'),
        options: [
          { value: 'yes', label: at('common.yes') },
          { value: 'no', label: at('q.navigoCard.toOrder') },
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
    throw new Error(at('errors.minAge'))
  }

  if (profile === 'junior') {
    return recommend('imagine_r_junior', [
      at('why.juniorAge', { age }),
      at('why.juniorGuardian'),
    ])
  }

  if (profile === 'scolaire') {
    if (!answers.isEnrolled) {
      throw new Error(at('errors.scolaireNotEnrolled'))
    }
    const product: ProductType = 'imagine_r_scolaire'
    const withScholarship = Boolean(answers.hasScholarship)
    return recommend(
      product,
      [
        at('why.scolaireAge', { age }),
        withScholarship ? at('why.scholarshipFare') : at('why.fullFareSchool'),
      ],
      withScholarship,
    )
  }

  if (profile === 'etudiant') {
    if (!answers.isEnrolled) {
      throw new Error(at('errors.etudiantNotEnrolled'))
    }
    const withScholarship = Boolean(answers.hasScholarship)
    return recommend(
      'imagine_r_etudiant',
      [
        at('why.etudiantAge', { age }),
        withScholarship ? at('why.scholarshipReduction') : at('why.studentCertificate'),
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

  throw new Error(at('errors.unsupportedProfile'))
}

function resolveAdultSeniorRecommendation(
  context: SubscriptionContext,
  answers: SubscriptionAnswers,
  preferSenior: boolean,
): SubscriptionRecommendation {
  const habit = answers.travelHabit
  if (!habit) throw new Error(at('errors.answerToContinue'))

  if (habit === 'daily') {
    const product: ProductType = preferSenior ? 'navigo_senior' : 'navigo_annuel'
    return recommend(product, [
      at('why.dailyFrequent'),
      preferSenior ? at('why.seniorFare', { age: context.age }) : at('why.allZones'),
    ])
  }

  if (habit === 'occasional') {
    return recommend(
      'liberte_plus',
      [at('why.occasionalNoYear'), at('why.perValidation')],
      false,
      at('usage.shortTickets'),
    )
  }

  if (habit === 'social_rights') {
    const level = answers.socialRightLevel
    if (!level) throw new Error(at('errors.specifyTst'))
    return recommend(
      'tst',
      [at('why.tstEligible'), tstTariffHint(level), at('why.tstRenewed')],
      false,
      tstTariffHint(level),
    )
  }

  if (habit === 'department_assigned') {
    return recommend('amethyste', [
      at('why.amethysteAssigned'),
      at('why.amethysteCheck'),
    ])
  }

  throw new Error(at('errors.unrecognized'))
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
    tariffLabel = at('tariff.liberte')
  } else if (productType === 'tst') {
    tariffLabel = at('tariff.tst')
  } else if (productType === 'amethyste') {
    tariffLabel = at('tariff.amethyste')
  } else {
    tariffLabel = at('tariff.perYear', { amount: estimatedTariff.toFixed(0) })
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
        reason: at('alternatives.toLiberte'),
      },
    ]
  }
  if (productType === 'liberte_plus') {
    return [
      {
        productLabel: productCatalog.navigo_annuel.label,
        reason: at('alternatives.toAnnual'),
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
