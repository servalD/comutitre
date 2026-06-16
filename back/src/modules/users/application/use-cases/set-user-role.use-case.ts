import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../domain/user';
import { UserRepository } from '../../domain/user.repository';
import { Role } from '../../../../shared/enums/role.enum';

/**
 * Admin-only: replace the roles of a user. Demonstrates RBAC enforcement.
 */
@Injectable()
export class SetUserRoleUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string, roles: Role[]): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return this.userRepository.updateRoles(id, roles);
  }
}
