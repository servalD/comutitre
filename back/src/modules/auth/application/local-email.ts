export const normalizeLocalEmail = (email: string): string =>
  email.trim().toLowerCase();

export const normalizeLocalEmailValue = (value: unknown): unknown =>
  typeof value === 'string' ? normalizeLocalEmail(value) : value;
