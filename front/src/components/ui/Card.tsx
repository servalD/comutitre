import type { ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  as?: 'div' | 'button'
}

export function Card({
  children,
  className,
  onClick,
  as: Component = 'div',
}: CardProps) {
  return (
    <Component
      className={[styles.card, onClick ? styles.clickable : '', className]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      type={Component === 'button' ? 'button' : undefined}
    >
      {children}
    </Component>
  )
}
