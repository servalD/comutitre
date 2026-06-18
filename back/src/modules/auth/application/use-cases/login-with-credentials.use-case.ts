import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../../../users/domain/user.repository';
import { normalizeLocalEmail } from '../local-email';
import { AppJwtService } from '../../infrastructure/app-jwt.service';
import { AuthProvider } from '../../../users/domain/user';

export interface LoginWithCredentialsParams {
  email: string;
  password: string;
}

export interface LoginWithCredentialsResult {
  accessToken: string;
}

/**
 * Validates email/password credentials and issues a session JWT.
 * Returns a generic error to avoid leaking whether the email exists.
 */
@Injectable()
export class LoginWithCredentialsUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly appJwtService: AppJwtService,
  ) {}

  async execute(
    params: LoginWithCredentialsParams,
  ): Promise<LoginWithCredentialsResult> {
    const email = normalizeLocalEmail(params.email);
    const credentials = await this.userRepository.findLocalByEmail(email);

    const isValid =
      credentials !== null &&
      (await bcrypt.compare(params.password, credentials.passwordHash));

    if (!isValid) {
      throw new UnauthorizedException('Identifiants incorrects.');
    }

    const { user } = credentials;
    const accessToken = await this.appJwtService.sign({
      provider: AuthProvider.LOCAL,
      subject: user.email!,
      email: user.email,
      walletAddress: null,
      displayName: user.displayName,
    });

    return { accessToken };
  }
}
