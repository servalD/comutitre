import { ExternalIdentity } from '../domain/external-identity';
import { ProvisionOwnerIdentityInput } from '../../mobility/application/use-cases/provision-owner-mobility-identity.use-case';

function parseDisplayName(
  displayName: string,
): { firstName: string; lastName: string } | null {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return null;
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: parts[0] };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

export function ownerIdentityInputFromExternalIdentity(
  identity: ExternalIdentity,
): ProvisionOwnerIdentityInput | null {
  if (!identity.birthDate) {
    return null;
  }

  const birthDate = new Date(identity.birthDate);
  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  if (identity.givenName && identity.familyName) {
    return {
      firstName: identity.givenName,
      lastName: identity.familyName,
      birthDate,
    };
  }

  if (identity.displayName) {
    const parsed = parseDisplayName(identity.displayName);
    if (parsed) {
      return { ...parsed, birthDate };
    }
  }

  return null;
}
