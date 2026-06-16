import { Injectable } from '@nestjs/common';
import { User } from '../../domain/user';
import { UpsertUserParams, UserRepository } from '../../domain/user.repository';

/**
 * Find-or-create the local user matching a verified external identity.
 * Called by the auth layer on every authenticated request so the local
 * representation (and its app roles) stays in sync with the provider.
 */
@Injectable()
export class SyncUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  execute(params: UpsertUserParams): Promise<User> {
    return this.userRepository.save(params);
  }
}
