export const buildFranceConnectErrorRedirectUrl = (
  frontendUrl: string,
  error: string,
  errorDescription?: string,
): string => {
  const params = new URLSearchParams({ error });
  if (errorDescription) {
    params.set('error_description', errorDescription);
  }
  return `${frontendUrl}/auth/callback#${params.toString()}`;
};
