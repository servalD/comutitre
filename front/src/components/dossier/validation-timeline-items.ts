export interface ValidationTimelineItem {
  id: string
  label: string
  date: string
  done?: boolean
  active?: boolean
}

export function buildValidationTimelineItems(
  validated: boolean,
): ValidationTimelineItem[] {
  if (validated) {
    return [
      { id: '1', label: 'Dossier envoyé', date: "Aujourd'hui", done: true },
      { id: '2', label: 'Vérification documents', date: 'Validé', done: true },
      { id: '3', label: 'Activation titre', date: "Aujourd'hui", done: true },
    ]
  }

  return [
    { id: '1', label: 'Dossier envoyé', date: "Aujourd'hui", done: true },
    { id: '2', label: 'Vérification documents', date: 'En cours', active: true },
    { id: '3', label: 'Activation titre', date: 'En attente' },
  ]
}
