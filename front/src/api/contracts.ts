const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export interface ContractResponse {
  id: string;
  status: string;
  productCode: string;
  holderFirstName?: string;
  holderLastName?: string;
  holderEmail: string;
  payerFirstName?: string | null;
  payerLastName?: string | null;
  payerEmail?: string | null;
  legalRepEmail?: string | null;
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

export interface SignatureStatusResponse {
  yousignStatus: string | null;
  signatureLink: string | null;
  contractStatus: string;
  alreadySigned: boolean;
  awaitingPayment?: boolean;
  awaitingValidation?: boolean;
}

export interface StartSignatureResponse {
  signatureLink: string | null;
  contractStatus?: string;
  alreadySigned?: boolean;
}

export interface ConfirmPaymentResponse {
  status: string;
  alreadyConfirmed: boolean;
  mobilityIdentityId?: string | null;
}

export interface CreateCheckoutSessionResponse {
  mode: 'mock' | 'checkout';
  sessionId: string | null;
  url: string;
}

export interface CreateCheckoutSessionPayload {
  payMode: 'quarterly' | 'monthly';
}

export interface ConfirmValidationResponse {
  status: string;
  alreadyValidated: boolean;
  mobilityIdentityId?: string | null;
}

export interface ContractDocumentsReadiness {
  complete: boolean;
  missing: string[];
  pending: string[];
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

  getDocumentsReadiness(
    token: string,
    contractId: string,
  ): Promise<ContractDocumentsReadiness> {
    return request<ContractDocumentsReadiness>(
      `/contracts/${contractId}/documents/readiness`,
      token,
    );
  },

  startSignature(token: string, contractId: string): Promise<StartSignatureResponse> {
    return request<StartSignatureResponse>(
      `/contracts/${contractId}/signature`,
      token,
      { method: 'POST', body: '{}' },
    );
  },

  getSignatureStatus(
    token: string,
    contractId: string,
  ): Promise<SignatureStatusResponse> {
    return request<SignatureStatusResponse>(
      `/contracts/${contractId}/signature/status`,
      token,
    );
  },

  confirmPayment(
    token: string,
    contractId: string,
  ): Promise<ConfirmPaymentResponse> {
    return request<ConfirmPaymentResponse>(
      `/contracts/${contractId}/payment/confirm`,
      token,
      { method: 'POST', body: '{}' },
    );
  },

  createCheckoutSession(
    token: string,
    contractId: string,
    payload: CreateCheckoutSessionPayload,
  ): Promise<CreateCheckoutSessionResponse> {
    return request<CreateCheckoutSessionResponse>(
      `/contracts/${contractId}/payment/checkout-session`,
      token,
      { method: 'POST', body: JSON.stringify(payload) },
    );
  },

  confirmValidation(
    token: string,
    contractId: string,
  ): Promise<ConfirmValidationResponse> {
    return request<ConfirmValidationResponse>(
      `/contracts/${contractId}/validation/confirm`,
      token,
      { method: 'POST', body: '{}' },
    );
  },

  async getCgvuPreview(token: string, contractId: string): Promise<Blob> {
    const res = await fetch(`${API_BASE}/contracts/${contractId}/cgvu/preview`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message =
        (body as { message?: string }).message ?? `Erreur ${res.status}`;
      throw new Error(message);
    }

    return res.blob();
  },
};
