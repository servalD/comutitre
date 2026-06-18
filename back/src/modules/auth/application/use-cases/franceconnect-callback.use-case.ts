import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ProvisionOwnerMobilityIdentityUseCase } from '../../../mobility/application/use-cases/provision-owner-mobility-identity.use-case';
import { SyncUserUseCase } from '../../../users/application/use-cases/sync-user.use-case';
import { ownerIdentityInputFromExternalIdentity } from '../owner-identity-from-auth';
import { FranceConnectService } from '../../infrastructure/franceconnect.service';
import { AppJwtService } from '../../infrastructure/app-jwt.service';

export interface FranceConnectCallbackResult {
  /** App session token (our own JWT) for subsequent API calls. */
  accessToken: string;
  userId: string;
}

export interface FranceConnectCallbackInput {
  code?: string;
  error?: string;
  errorDescription?: string;
}

/**
 * Completes FranceConnect login: exchanges the code for an identity, syncs the
 * local user, and issues an app session JWT the SPA can use as a Bearer token.
 */
@Injectable()
export class FranceConnectCallbackUseCase {
  private readonly logger = new Logger(FranceConnectCallbackUseCase.name);

  constructor(
    private readonly franceConnect: FranceConnectService,
    private readonly syncUser: SyncUserUseCase,
    private readonly appJwtService: AppJwtService,
    private readonly provisionOwnerIdentity: ProvisionOwnerMobilityIdentityUseCase,
  ) {}

  async execute(
    input: string | FranceConnectCallbackInput,
  ): Promise<FranceConnectCallbackResult> {
    const callback = typeof input === 'string' ? { code: input } : input;
    if (callback.error) {
      throw new UnauthorizedException(
        callback.errorDescription ||
          `FranceConnect callback failed: ${callback.error}`,
      );
    }

    const identity = await this.franceConnect.handleCallback(
      callback.code ?? '',
    );
    const user = await this.syncUser.execute({
      provider: identity.provider,
      providerSubject: identity.subject,
      email: identity.email,
      walletAddress: identity.walletAddress,
      displayName: identity.displayName,
    });

    const ownerInput = ownerIdentityInputFromExternalIdentity(identity);
    if (ownerInput) {
      await this.provisionOwnerIdentity.execute(user, ownerInput);
    } else {
      this.logger.warn(
        `Skipping owner mobility identity for account ${user.id}: missing birth date from provider`,
      );
    }

    const accessToken = await this.appJwtService.sign(identity);
    return { accessToken, userId: user.id };
  }
}
