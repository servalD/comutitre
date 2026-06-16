import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route (or controller) as public: the global {@link AuthGuard} skips it.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
