import type { DocumentType, ProductType } from '../types/mobility'
import { documentTypeLabels, productLabels } from '../../constants/labels'

export interface ProductCatalogEntry {
  label: string
  shortDescription: string
  typicalDuration: string
  documents: DocumentType[]
}

export const productCatalog: Record<ProductType, ProductCatalogEntry> = {
  imagine_r_junior: {
    label: productLabels.imagine_r_junior,
    shortDescription: 'Forfait jeune de 4 à 10 ans, valable sur l’année scolaire.',
    typicalDuration: '12 mois (saison scolaire)',
    documents: ['identity_document', 'photo', 'school_certificate'],
  },
  imagine_r_scolaire: {
    label: productLabels.imagine_r_scolaire,
    shortDescription: 'Forfait scolaire de 11 à 17 ans, renouvelé chaque année.',
    typicalDuration: '12 mois (saison scolaire)',
    documents: ['identity_document', 'photo', 'school_certificate'],
  },
  imagine_r_etudiant: {
    label: productLabels.imagine_r_etudiant,
    shortDescription: 'Forfait étudiant de 18 à 25 ans, sur justificatif d’inscription.',
    typicalDuration: '12 mois (saison)',
    documents: ['identity_document', 'photo', 'student_certificate'],
  },
  navigo_annuel: {
    label: productLabels.navigo_annuel,
    shortDescription: 'Abonnement toutes zones, idéal pour les trajets quotidiens.',
    typicalDuration: '12 mois, renouvellement automatique',
    documents: ['identity_document', 'photo', 'address_proof', 'payment_mandate'],
  },
  navigo_senior: {
    label: productLabels.navigo_senior,
    shortDescription: 'Tarif préférentiel à partir de 62 ans pour les déplacements réguliers.',
    typicalDuration: '12 mois',
    documents: ['identity_document', 'photo'],
  },
  liberte_plus: {
    label: productLabels.liberte_plus,
    shortDescription: 'Payez uniquement vos trajets validés — sans engagement annuel.',
    typicalDuration: 'Sans durée fixe (facturation mensuelle des trajets)',
    documents: ['identity_document', 'payment_mandate'],
  },
  tst: {
    label: productLabels.tst,
    shortDescription: 'Réduction ou gratuité selon vos droits sociaux (RSA, CAF, etc.).',
    typicalDuration: '3 mois renouvelables',
    documents: ['identity_document', 'social_right', 'address_proof'],
  },
  amethyste: {
    label: productLabels.amethyste,
    shortDescription: 'Droit attribué par votre département, chargé sur passe Navigo.',
    typicalDuration: 'Selon attribution départementale',
    documents: ['identity_document', 'address_proof'],
  },
}

export const scholarshipExtraDocument: DocumentType = 'scholarship_certificate'

export const travelHabitHelp = {
  daily: {
    title: 'Trajets quotidiens',
    body: 'Vous prenez les transports en commun presque tous les jours (travail, études). Un forfait annuel est en général le plus avantageux sur 12 mois.',
  },
  occasional: {
    title: 'Trajets occasionnels',
    body: 'Vous voyagez de temps en temps, sans besoin d’un abonnement à l’année. Navigo Liberté+ facture chaque trajet validé. Existent aussi Navigo Mois et Navigo Semaine (titres courts) — hors périmètre de cette démo.',
  },
  social_rights: {
    title: 'Droits sociaux',
    body: 'Vous bénéficiez de la Tarification Solidarité Transport (TST) : gratuité, −75 % ou −50 % selon votre situation (RSA, CAF, France Travail, MDPH…).',
  },
  department_assigned: {
    title: 'Droit départemental',
    body: 'Le forfait Améthyste est attribué par votre département. Ce n’est pas une souscription classique : on vérifie votre éligibilité puis on charge le droit sur votre passe.',
  },
} as const

export function documentLabelsFor(types: DocumentType[]): string[] {
  return types.map((type) => documentTypeLabels[type])
}
