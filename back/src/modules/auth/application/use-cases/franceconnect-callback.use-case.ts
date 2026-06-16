import { Injectable } from '@nestjs/common';
import { SyncUserUseCase } from '../../../users/application/use-cases/sync-user.use-case';
import { FranceConnectService } from '../../infrastructure/franceconnect.service';
import { AppJwtService } from '../../infrastructure/app-jwt.service';

export interface FranceConnectCallbackResult {
  /** App session token (our own JWT) for subsequent API calls. */
  accessToken: string;
  userId: string;
}

/**
 * Completes FranceConnect login: exchanges the code for an identity, syncs the
 * local user, and issues an app session JWT the SPA can use as a Bearer token.
 */
@Injectable()
export class FranceConnectCallbackUseCase {
  constructor(
    private readonly franceConnect: FranceConnectService,
    private readonly syncUser: SyncUserUseCase,
    private readonly appJwtService: AppJwtService,
  ) {}

  async execute(code: string): Promise<FranceConnectCallbackResult> {
    const identity = await this.franceConnect.handleCallback(code);
    const user = await this.syncUser.execute({
      provider: identity.provider,
      providerSubject: identity.subject,
      email: identity.email,
      walletAddress: identity.walletAddress,
      displayName: identity.displayName,
    });
    const accessToken = await this.appJwtService.sign(identity);
    return { accessToken, userId: user.id };
  }
}
