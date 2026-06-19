import i18n from '../i18n';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const MOCK_MODE = import.meta.env.VITE_MOCK_AUTH === 'true';

export interface TokenResponse {
  accessToken: string;
}

export interface UserResponse {
  id: string;
  provider: string;
  email: string | null;
  walletAddress: string | null;
  displayName: string | null;
  roles: string[];
  createdAt: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CheckIdentityMatchPayload {
  firstName: string;
  lastName: string;
  birthDate: string;
}

export interface CheckIdentityMatchResponse {
  matched: boolean;
  maskedHolder?: string;
  recoveryEligible?: boolean;
}

export type RequestRecoveryPayload = RegisterPayload;

export interface RequestRecoveryResponse {
  message: string;
  maskedGuardianEmail?: string;
  devCode?: string;
}

export interface CompleteRecoveryPayload {
  email: string;
  code: string;
}

const MOCK_TOKEN = 'mock-jwt-token';

// Dernière session mock en mémoire
let mockSession: UserResponse = {
  id: 'mock-user-1',
  provider: 'local',
  email: 'demo@comutitres.fr',
  walletAddress: null,
  displayName: 'Demo Utilisateur',
  roles: ['user'],
  createdAt: new Date().toISOString(),
};

function delay(ms = 500): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

let mockRecoveryCode: string | null = null;
let mockRecoveryEmail: string | null = null;

const mockAuth = {
  async register(payload: RegisterPayload): Promise<TokenResponse> {
    await delay();
    mockSession = {
      id: `mock-${crypto.randomUUID()}`,
      provider: 'local',
      email: payload.email,
      walletAddress: null,
      displayName: `${payload.firstName} ${payload.lastName}`.trim(),
      roles: ['user'],
      createdAt: new Date().toISOString(),
    };
    return { accessToken: MOCK_TOKEN };
  },

  async login(payload: LoginPayload): Promise<TokenResponse> {
    await delay();
    mockSession = {
      id: `mock-${crypto.randomUUID()}`,
      provider: 'local',
      email: payload.email,
      walletAddress: null,
      displayName: payload.email.split('@')[0],
      roles: ['user'],
      createdAt: new Date().toISOString(),
    };
    return { accessToken: MOCK_TOKEN };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async me(_token: string): Promise<UserResponse> {
    await delay(150);
    return mockSession;
  },

  async loginWithFranceConnect(): Promise<TokenResponse> {
    await delay();
    mockSession = {
      id: 'mock-fc-1',
      provider: 'franceconnect',
      email: 'jean.dupont@franceconnect.fr',
      walletAddress: null,
      displayName: 'Jean Dupont',
      roles: ['user'],
      createdAt: new Date().toISOString(),
    };
    return { accessToken: MOCK_TOKEN };
  },

  franceConnectLoginUrl(): string {
    return `/auth/callback#access_token=${MOCK_TOKEN}`;
  },

  async checkIdentityMatch(
    payload: CheckIdentityMatchPayload,
  ): Promise<CheckIdentityMatchResponse> {
    await delay(300);
    const isJules =
      payload.firstName.trim().toLowerCase() === 'jules' &&
      payload.lastName.trim().toLowerCase() === 'dupont' &&
      payload.birthDate === '2009-06-12';
    if (!isJules) {
      return { matched: false };
    }
    return {
      matched: true,
      maskedHolder: 'J*** D***',
      recoveryEligible: true,
    };
  },

  async requestRecovery(
    payload: RequestRecoveryPayload,
  ): Promise<RequestRecoveryResponse> {
    await delay(400);
    mockRecoveryCode = '123456';
    mockRecoveryEmail = payload.email;
    return {
      message:
        'Un code de vérification a été envoyé à l’adresse e-mail de votre responsable légal.',
      maskedGuardianEmail: 'm***@example.com',
      devCode: mockRecoveryCode,
    };
  },

  async completeRecovery(
    payload: CompleteRecoveryPayload,
  ): Promise<TokenResponse> {
    await delay(400);
    if (
      payload.code !== mockRecoveryCode ||
      payload.email !== mockRecoveryEmail
    ) {
      throw new Error('Code invalide ou expiré.');
    }
    mockSession = {
      id: 'mock-jules-1',
      provider: 'local',
      email: payload.email,
      walletAddress: null,
      displayName: 'Jules Dupont',
      roles: ['user'],
      createdAt: new Date().toISOString(),
    };
    mockRecoveryCode = null;
    mockRecoveryEmail = null;
    return { accessToken: MOCK_TOKEN };
  },
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      (body as { message?: string }).message ??
      i18n.t('errors.http', { ns: 'common', status: res.status });
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

const realAuth = {
  register(payload: RegisterPayload): Promise<TokenResponse> {
    return request<TokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  login(payload: LoginPayload): Promise<TokenResponse> {
    return request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  me(token: string): Promise<UserResponse> {
    return request<UserResponse>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  loginWithFranceConnect(): Promise<TokenResponse> {
    // In real mode: redirect the browser to the backend FC flow.
    window.location.href = `${API_BASE}/auth/franceconnect/login`;
    return new Promise(() => {}); // never resolves — browser navigates away
  },

  franceConnectLoginUrl(): string {
    return `${API_BASE}/auth/franceconnect/login`;
  },

  checkIdentityMatch(
    payload: CheckIdentityMatchPayload,
  ): Promise<CheckIdentityMatchResponse> {
    return request<CheckIdentityMatchResponse>('/auth/check-identity-match', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  requestRecovery(
    payload: RequestRecoveryPayload,
  ): Promise<RequestRecoveryResponse> {
    return request<RequestRecoveryResponse>('/auth/request-recovery', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  completeRecovery(payload: CompleteRecoveryPayload): Promise<TokenResponse> {
    return request<TokenResponse>('/auth/complete-recovery', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export const authApi = MOCK_MODE ? mockAuth : realAuth;
