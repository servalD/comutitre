import { ConflictException, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../../../users/domain/user.repository';
import { AppJwtService } from '../../infrastructure/app-jwt.service';
import { AuthProvider } from '../../../users/domain/user';

export interface RegisterParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterResult {
  accessToken: string;
}

/**
 * Creates a new local (email + password) account and issues a session token.
 * Fails with 409 if the email is already registered.
 */
@Injectable()
export class RegisterUseCase {
  private readonly logger = new Logger(RegisterUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly appJwtService: AppJwtService,
  ) {}

  async execute(params: RegisterParams): Promise<RegisterResult> {
    const existing = await this.userRepository.findLocalByEmail(params.email);
    if (existing) {
      throw new ConflictException('Cette adresse e-mail est déjà utilisée.');
    }

    const passwordHash = await bcrypt.hash(params.password, 12);
    const user = await this.userRepository.createLocal({
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      passwordHash,
    });

    this.logger.log(`New local account created: ${user.id}`);

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
