import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import frCommon from './locales/fr/common.json'
import frAuth from './locales/fr/auth.json'
import frLanding from './locales/fr/landing.json'
import frDashboard from './locales/fr/dashboard.json'
import frMobility from './locales/fr/mobility.json'
import frDossier from './locales/fr/dossier.json'
import frFoyer from './locales/fr/foyer.json'
import frSubscription from './locales/fr/subscription.json'
import frDomain from './locales/fr/domain.json'

import enCommon from './locales/en/common.json'
import enAuth from './locales/en/auth.json'
import enLanding from './locales/en/landing.json'
import enDashboard from './locales/en/dashboard.json'
import enMobility from './locales/en/mobility.json'
import enDossier from './locales/en/dossier.json'
import enFoyer from './locales/en/foyer.json'
import enSubscription from './locales/en/subscription.json'
import enDomain from './locales/en/domain.json'

export const defaultNS = 'common'

export const resources = {
  fr: {
    common: frCommon,
    auth: frAuth,
    landing: frLanding,
    dashboard: frDashboard,
    mobility: frMobility,
    dossier: frDossier,
    foyer: frFoyer,
    subscription: frSubscription,
    domain: frDomain,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    landing: enLanding,
    dashboard: enDashboard,
    mobility: enMobility,
    dossier: enDossier,
    foyer: enFoyer,
    subscription: enSubscription,
    domain: enDomain,
  },
} as const

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en'],
    defaultNS,
    ns: [
      'common',
      'auth',
      'landing',
      'dashboard',
      'mobility',
      'dossier',
      'foyer',
      'subscription',
      'domain',
    ],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'comutitres_lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  })

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
})

export default i18n
