import { AuthProvider } from '../../users/domain/user';

/**
 * Provider-agnostic identity produced after a token is cryptographically
 * verified (Dynamic) or an OIDC flow completes (FranceConnect). This is what
 * the rest of the app consumes — it never sees raw provider tokens.
 */
export interface ExternalIdentity {
  provider: AuthProvider;
  /** Stable unique subject within the provider (maps to providerSubject). */
  subject: string;
  email: string | null;
  walletAddress: string | null;
  displayName: string | null;
  givenName?: string | null;
  familyName?: string | null;
  /** ISO date (YYYY-MM-DD) when the provider exposes it (e.g. FranceConnect). */
  birthDate?: string | null;
}
