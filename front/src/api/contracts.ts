const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export interface ContractResponse {
  id: string;
  status: string;
  productCode: string;
  holderFirstName?: string;
  holderLastName?: string;
  holderEmail: string;
  payerEmail?: string | null;
  cgvuVersion: string;
  yousignSignatureLink?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractPayload {
  productCode: string;
  holderFirstName: string;
  holderLastName: string;
  holderEmail: string;
  payerFirstName?: string;
  payerLastName?: string;
  payerEmail?: string;
  legalRepEmail?: string;
}

async function request<T>(
  path: string,
  token: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      (body as { message?: string }).message ?? `Erreur ${res.status}`;
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export const contractsApi = {
  create(token: string, payload: CreateContractPayload): Promise<ContractResponse> {
    return request<ContractResponse>('/contracts', token, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  list(token: string): Promise<ContractResponse[]> {
    return request<ContractResponse[]>('/contracts/me', token);
  },

  get(token: string, id: string): Promise<ContractResponse> {
    return request<ContractResponse>(`/contracts/${id}`, token);
  },

  startSignature(token: string, contractId: string): Promise<{ signatureLink: string | null }> {
    return request<{ signatureLink: string | null }>(
      `/contracts/${contractId}/signature`,
      token,
      { method: 'POST', body: '{}' },
    );
  },

  getSignatureStatus(
    token: string,
    contractId: string,
  ): Promise<{ yousignStatus: string | null; signatureLink: string | null }> {
    return request(`/contracts/${contractId}/signature/status`, token);
  },
};
