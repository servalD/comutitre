import { Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/user';
import { SyncUserUseCase } from '../../../users/application/use-cases/sync-user.use-case';
import { TokenVerifier } from '../ports/token-verifier.port';

/**
 * Verifies a Bearer token and resolves it to the local user (find-or-create).
 * Used by the global AuthGuard on every protected request.
 */
@Injectable()
export class AuthenticateBearerUseCase {
  constructor(
    private readonly tokenVerifier: TokenVerifier,
    private readonly syncUser: SyncUserUseCase,
  ) {}

  async execute(token: string): Promise<User> {
    const identity = await this.tokenVerifier.verify(token);
    return this.syncUser.execute({
      provider: identity.provider,
      providerSubject: identity.subject,
      email: identity.email,
      walletAddress: identity.walletAddress,
      displayName: identity.displayName,
    });
  }
}
