import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PublicAppFrame } from '../components/layout/PublicAppFrame'
import styles from './Landing.module.css'

const LANDING_HERO_SRC = '/images/landing-hero.png'
const IDFM_LOGO_SRC = '/images/idfm-mobilites-logo.png'

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2 6l3 3 5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Landing() {
  const { t } = useTranslation('landing')
  const benefits = t('benefits', { returnObjects: true }) as string[]
  return (
    <PublicAppFrame variant="white">
      <div className={styles.landing}>
        <header className={styles.mobileHeader}>
          <img
            src={IDFM_LOGO_SRC}
            alt="îledeFrance mobilités"
            className={styles.idfmLogo}
          />
          <span className={styles.comutitresMarkMobile}>Comutitres</span>
        </header>

        <section className={styles.heroPanel}>
          <img
            src={LANDING_HERO_SRC}
            alt=""
            className={styles.heroImage}
            aria-hidden="true"
          />
          <div className={styles.heroBrand}>
            <img
              src={IDFM_LOGO_SRC}
              alt="îledeFrance mobilités"
              className={styles.idfmLogo}
            />
          </div>
        </section>

        <div className={styles.contentColumn}>
          <header className={styles.contentHeader}>
            <span className={styles.comutitresMark}>Comutitres</span>
          </header>

          <main className={styles.body}>
            <h1 className={styles.headline}>{t('headline')}</h1>

            <ul className={styles.benefits}>
              {benefits.map((text) => (
                <li key={text} className={styles.benefit}>
                  <span className={styles.benefitIcon}>
                    <CheckIcon />
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <div className={styles.actions}>
              <Link to="/login" className={styles.cta}>
                {t('cta')}
              </Link>
              <a href="https://www.comutitres.fr/contact" className={styles.helpLink}>
                {t('help')}
              </a>
            </div>
          </main>
        </div>
      </div>
    </PublicAppFrame>
  )
}
