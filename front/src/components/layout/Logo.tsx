import { Link } from 'react-router-dom'
import logo from '../../assets/comutitres_v_couleur.svg'
import styles from './Logo.module.css'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <Link
      to="/"
      className={[styles.logoLink, className].filter(Boolean).join(' ')}
      aria-label="Comutitres — Accueil"
    >
      <img src={logo} alt="Comutitres" className={styles.logo} />
    </Link>
  )
}
