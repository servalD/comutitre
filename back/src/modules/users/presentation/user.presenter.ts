import { User } from '../domain/user';
import { Role } from '../../../shared/enums/role.enum';

export interface UserResponse {
  id: string;
  provider: string;
  email: string | null;
  walletAddress: string | null;
  displayName: string | null;
  roles: Role[];
  createdAt: string;
}

/**
 * Maps a domain {@link User} to the public API shape. Deliberately omits the
 * raw provider subject from list responses kept minimal for the demo.
 */
export const toUserResponse = (user: User): UserResponse => ({
  id: user.id,
  provider: user.provider,
  email: user.email,
  walletAddress: user.walletAddress,
  displayName: user.displayName,
  roles: user.roles,
  createdAt: user.createdAt.toISOString(),
});
