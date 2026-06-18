export type TabId = 'accueil' | 'foyer' | 'aide'

export interface NavItem {
  id: TabId
  label: string
  to: string
  disabled?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'accueil', label: 'Accueil', to: '/espace' },
  { id: 'foyer', label: 'Mon foyer', to: '/foyer' },
  { id: 'aide', label: 'Aide', to: '/aide' },
]
