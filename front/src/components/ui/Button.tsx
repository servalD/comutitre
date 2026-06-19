import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  className,
  children,
  fullWidth = false,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={[
        styles.button,
        styles[variant],
        fullWidth ? styles.fullWidth : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
