import styles from './ProgressBar.module.css'

interface ProgressBarProps {
  value: number
  max: number
}

export function ProgressBar({ value, max }: ProgressBarProps) {
  const percent = Math.min(100, Math.round((value / max) * 100))

  return (
    <div
      className={styles.bar}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div className={styles.fill} style={{ width: `${percent}%` }} />
    </div>
  )
}
