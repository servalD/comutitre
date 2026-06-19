import i18n from '../i18n';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

const ts = (key: string, options?: Record<string, unknown>): string =>
  i18n.t(key, { ns: 'subscription', ...options });

export interface JustificatifResponse {
  id: string;
  contractId: string;
  type: string;
  status: string;
  originalFilename: string;
  yousignStatus?: string | null;
  yousignStatusCodes: string[];
  agentDecision?: string | null;
  agentMotif?: string | null;
  decidedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const JUSTIFICATIF_TYPE_VALUES = [
  'piece_identite',
  'justificatif_domicile',
  'certificat_scolarite',
  'attestation_bourse',
  'photo',
  'mandat_sepa',
  'attestation_caf',
  'autre',
] as const;

/** Types vérifiés automatiquement via YouSign Document Verification. */
export const YOUSIGN_VERIFIED_TYPES = new Set<string>([
  'piece_identite',
]);

export function isYousignVerifiedType(type: string): boolean {
  return YOUSIGN_VERIFIED_TYPES.has(type);
}

export function justificatifTypes(): { value: string; label: string }[] {
  return JUSTIFICATIF_TYPE_VALUES.map((value) => ({
    value,
    label: ts(`docs.types.${value}`),
  }));
}

export function docStatusLabel(status: string): string {
  return ts(`docs.statuses.${status}`, { defaultValue: status });
}

export const STATUS_COLORS: Record<string, string> = {
  recu: '#1972D2',
  en_cours_de_verification: '#F39224',
  pre_qualifie: '#1972D2',
  a_revoir: '#C52625',
  accepte: '#007D44',
  refuse: '#C52625',
  incomplet: '#F39224',
  expire: '#C52625',
};

/** Message client selon le résultat YouSign ou la file agent. */
export function clientStatusHint(j: JustificatifResponse): string | null {
  if (j.status === 'en_cours_de_verification') {
    return ts('docs.hints.verifying');
  }
  if (j.status === 'pre_qualifie') {
    return ts('docs.hints.preQualified');
  }
  if (j.status === 'a_revoir') {
    if (j.yousignStatusCodes.includes('IDDV_1103')) {
      return ts('docs.hints.idInvalid');
    }
    if (j.yousignStatusCodes.length > 0) {
      return ts('docs.hints.verificationFailed', { codes: j.yousignStatusCodes.join(', ') });
    }
    return ts('docs.hints.notMatching');
  }
  if (j.status === 'accepte') {
    return ts('docs.hints.accepted');
  }
  if (j.status === 'refuse') {
    return j.agentMotif ?? ts('docs.hints.refusedDefault');
  }
  return null;
}

async function authFetch<T>(
  path: string,
  token: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const raw = (body as { message?: string | string[] }).message;
    const message = Array.isArray(raw)
      ? raw.join(', ')
      : raw ?? i18n.t('errors.http', { ns: 'common', status: res.status });
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export const justificatifsApi = {
  upload(
    token: string,
    params: {
      contractId: string;
      type: string;
      file: File;
      firstName?: string;
      lastName?: string;
    },
  ): Promise<JustificatifResponse> {
    const form = new FormData();
    form.append('contractId', params.contractId);
    form.append('type', params.type);
    form.append('file', params.file);
    if (params.firstName) form.append('firstName', params.firstName);
    if (params.lastName) form.append('lastName', params.lastName);

    return authFetch<JustificatifResponse>('/justificatifs', token, {
      method: 'POST',
      body: form,
    });
  },

  list(token: string, contractId: string): Promise<JustificatifResponse[]> {
    return authFetch<JustificatifResponse[]>(
      `/justificatifs?contractId=${contractId}`,
      token,
    );
  },

  listPending(token: string): Promise<JustificatifResponse[]> {
    return authFetch<JustificatifResponse[]>('/justificatifs/pending', token);
  },

  validate(
    token: string,
    id: string,
    motif?: string,
  ): Promise<JustificatifResponse> {
    return authFetch<JustificatifResponse>(
      `/justificatifs/${id}/validate`,
      token,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motif }),
      },
    );
  },

  refuse(
    token: string,
    id: string,
    motif: string,
  ): Promise<JustificatifResponse> {
    return authFetch<JustificatifResponse>(
      `/justificatifs/${id}/refuse`,
      token,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motif }),
      },
    );
  },
};
