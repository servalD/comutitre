import type { ReactElement } from 'react'
import { LeaCharacter, MarieCharacter } from './characters'
import styles from './Avatar.module.css'

export type CharacterId = 'marie' | 'lea'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  character?: CharacterId
  variant?: 'default' | 'child'
}

const COLORS = ['#64b5f6', '#1972d2', '#f39224', '#007d44', '#4f338b']

const CHARACTERS: Record<CharacterId, () => ReactElement> = {
  marie: MarieCharacter,
  lea: LeaCharacter,
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getColor(name: string) {
  const index = name.charCodeAt(0) % COLORS.length
  return COLORS[index]
}

function inferCharacter(
  character: CharacterId | undefined,
  variant: 'default' | 'child',
): CharacterId | undefined {
  if (character) return character
  if (variant === 'child') return 'lea'
  return undefined
}

export function Avatar({
  name,
  size = 'md',
  character,
  variant = 'default',
}: AvatarProps) {
  const resolvedCharacter = inferCharacter(character, variant)
  const CharacterIllustration = resolvedCharacter
    ? CHARACTERS[resolvedCharacter]
    : null

  if (CharacterIllustration) {
    return (
      <div
        className={[styles.avatar, styles.character, styles[size]].join(' ')}
        aria-hidden="true"
      >
        <CharacterIllustration />
      </div>
    )
  }

  return (
    <div
      className={[styles.avatar, styles[size], styles[variant]].join(' ')}
      style={{ backgroundColor: getColor(name) }}
      aria-hidden="true"
    >
      {variant === 'child' ? (
        <svg viewBox="0 0 24 24" className={styles.icon}>
          <circle cx="12" cy="8" r="4" fill="currentColor" />
          <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" fill="currentColor" />
        </svg>
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  )
}
