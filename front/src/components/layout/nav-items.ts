export type TabId = 'accueil' | 'foyer' | 'aide'

export interface NavItem {
  id: TabId
  labelKey: string
  to: string
  disabled?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'accueil', labelKey: 'tabs.accueil', to: '/espace' },
  { id: 'foyer', labelKey: 'tabs.foyer', to: '/foyer' },
  { id: 'aide', labelKey: 'tabs.aide', to: '/aide' },
]
