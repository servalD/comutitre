import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import logo from '../../assets/comutitres_v_couleur.svg'
import styles from './Logo.module.css'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  const { t } = useTranslation('common')
  return (
    <Link
      to="/"
      className={[styles.logoLink, className].filter(Boolean).join(' ')}
      aria-label={t('logoAria')}
    >
      <img src={logo} alt={t('brand.name')} className={styles.logo} />
    </Link>
  )
}
