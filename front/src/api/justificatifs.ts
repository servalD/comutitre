const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

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

export const JUSTIFICATIF_TYPES = [
  { value: 'piece_identite', label: "Pièce d'identité" },
  { value: 'justificatif_domicile', label: 'Justificatif de domicile' },
  { value: 'certificat_scolarite', label: 'Certificat de scolarité' },
  { value: 'attestation_bourse', label: 'Attestation de bourse' },
  { value: 'photo', label: 'Photo' },
  { value: 'mandat_sepa', label: 'Mandat SEPA' },
  { value: 'attestation_caf', label: 'Attestation CAF' },
  { value: 'autre', label: 'Autre document' },
] as const;

export const STATUS_LABELS: Record<string, string> = {
  recu: 'Reçu',
  en_cours_de_verification: 'Vérification en cours…',
  pre_qualifie: 'Document conforme',
  a_revoir: 'Document non conforme',
  accepte: 'Accepté',
  refuse: 'Refusé',
  incomplet: 'Incomplet',
  expire: 'Expiré',
};

/** Message client selon le résultat YouSign. */
export function clientStatusHint(j: JustificatifResponse): string | null {
  if (j.status === 'en_cours_de_verification') {
    return 'Analyse automatique en cours par YouSign…';
  }
  if (j.status === 'pre_qualifie') {
    return 'Votre document a passé la vérification automatique. Un agent confirmera sous peu.';
  }
  if (j.status === 'a_revoir') {
    if (j.yousignStatusCodes.includes('IDDV_1103')) {
      return 'Ce fichier ne peut pas être traité comme une pièce d\'identité valide. Déposez une CNI, un passeport ou un titre de séjour lisible.';
    }
    if (j.yousignStatusCodes.length > 0) {
      return `Vérification échouée (${j.yousignStatusCodes.join(', ')}). Merci de déposer un nouveau document.`;
    }
    return 'Le document ne correspond pas aux critères attendus. Merci de déposer un nouveau fichier.';
  }
  if (j.status === 'accepte') {
    return 'Document validé définitivement.';
  }
  if (j.status === 'refuse') {
    return j.agentMotif ?? 'Document refusé par un agent.';
  }
  return null;
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
      : raw ?? `Erreur ${res.status}`;
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
