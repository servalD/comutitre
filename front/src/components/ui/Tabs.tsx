import styles from './Tabs.module.css'

export interface TabItem<T extends string> {
  id: T
  label: string
  icon: string
}

interface TabsProps<T extends string> {
  items: TabItem<T>[]
  active: T
  onChange: (id: T) => void
}

export function Tabs<T extends string>({ items, active, onChange }: TabsProps<T>) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Sections">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={active === item.id}
          className={active === item.id ? styles.active : styles.tab}
          onClick={() => onChange(item.id)}
        >
          <span aria-hidden="true">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  )
}
