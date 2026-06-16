import { ExternalIdentity } from '../../domain/external-identity';

/**
 * PORT: verifies a Bearer token and returns the normalized identity.
 * Implementations must throw if the token is missing, malformed, expired, or
 * its signature cannot be verified. Bound to a concrete adapter in AuthModule;
 * overridden with a fake in e2e tests.
 */
export abstract class TokenVerifier {
  abstract verify(token: string): Promise<ExternalIdentity>;
}
