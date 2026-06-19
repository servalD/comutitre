import type { ReactNode } from 'react'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'
import styles from './PublicAppFrame.module.css'

interface PublicAppFrameProps {
  children: ReactNode
  variant?: 'default' | 'elevated' | 'white'
}

export function PublicAppFrame({ children, variant = 'default' }: PublicAppFrameProps) {
  const isWhite = variant === 'white'
  const isElevated = variant === 'elevated' || isWhite
  const isFullPage = isWhite || variant === 'elevated'

  return (
    <div
      className={[
        styles.viewport,
        isWhite ? styles.viewportWhite : '',
        isFullPage ? styles.viewportFull : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={[
          styles.frame,
          isElevated ? styles.frameElevated : '',
          isWhite ? styles.frameWhite : '',
          isFullPage ? styles.frameFull : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className={styles.langBar}>
          <LanguageSwitcher />
        </div>
        {children}
      </div>
    </div>
  )
}
