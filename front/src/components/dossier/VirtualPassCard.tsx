import styles from './VirtualPassCard.module.css'

interface VirtualPassCardProps {
  holderName: string
  product: string
  validity: string
}

function NfcIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 12a4 4 0 0 0 4 4M8 8a8 8 0 0 0 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function VirtualPassCard({ holderName, product, validity }: VirtualPassCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandText}>navigo</span>
        </div>
        <div className={styles.nfc}>
          <NfcIcon />
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.avatar} aria-hidden="true">
          <span className={styles.avatarInitials}>
            {holderName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </span>
        </div>
        <div className={styles.info}>
          <p className={styles.name}>{holderName}</p>
          <p className={styles.product}>{product}</p>
          <p className={styles.validity}>{validity}</p>
        </div>
      </div>
    </div>
  )
}
