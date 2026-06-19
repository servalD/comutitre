export const MOBILITY_HOME = '/espace'
export const TITRES_HOME = '/abonnements'

export const MOBILITY_LOGIN = '/login'
export const TITRES_LOGIN = '/titres/login'

export const MOBILITY_REGISTER = '/register'
export const TITRES_REGISTER = '/titres/register'

export const MOBILITY_AUTH_CALLBACK = '/auth/callback'
export const TITRES_AUTH_CALLBACK = '/titres/auth/callback'

export const POST_AUTH_REDIRECT_KEY = 'comutitres.postAuthRedirect'

export type AuthZone = 'mobility' | 'titres'

export function homeForZone(zone: AuthZone): string {
  return zone === 'titres' ? TITRES_HOME : MOBILITY_HOME
}

export function loginForZone(zone: AuthZone): string {
  return zone === 'titres' ? TITRES_LOGIN : MOBILITY_LOGIN
}

export function registerForZone(zone: AuthZone): string {
  return zone === 'titres' ? TITRES_REGISTER : MOBILITY_REGISTER
}

export function isTitresPath(path: string): boolean {
  return (
    path.startsWith('/abonnements') ||
    path.startsWith('/justificatifs') ||
    path.startsWith('/contrat/') ||
    path.startsWith('/signature/') ||
    path.startsWith('/admin/dossiers') ||
    path.startsWith('/titres/')
  )
}

export function loginPathForReturnTo(path: string): string {
  return isTitresPath(path) ? TITRES_LOGIN : MOBILITY_LOGIN
}

export function rememberPostAuthRedirect(path: string): void {
  sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, path)
}

export function consumePostAuthRedirect(fallback: string): string {
  const stored = sessionStorage.getItem(POST_AUTH_REDIRECT_KEY)
  sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY)
  return stored && stored.startsWith('/') ? stored : fallback
}
