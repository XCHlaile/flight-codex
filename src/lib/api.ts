import type {
  AircraftRecord,
  AviationEventRecord,
  AviationExpertRecord,
  CatalogResponse,
  CreateAircraftRequest,
  DashboardSummary,
} from '../../shared/aviation';
import type { AuthSession, LoginRequest, RegisterRequest } from '../../shared/auth';
import { getStoredToken } from '@/lib/auth-storage';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: string;
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers || {});
  const token = getStoredToken();

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });
  const text = await response.text();
  let payload: ApiEnvelope<T> | null = null;

  if (text) {
    try {
      payload = JSON.parse(text) as ApiEnvelope<T>;
    } catch {
      throw new Error('后端服务返回格式异常，请确认 API 服务已启动。');
    }
  }

  if (!payload) {
    throw new Error('后端服务无响应，请先启动 API 服务。');
  }

  if (!response.ok || !payload.success) {
    throw new Error(payload.error || '请求失败');
  }

  return payload.data;
}

export function getSummary() {
  return request<DashboardSummary>('/api/summary');
}

export function login(payload: LoginRequest) {
  return request<AuthSession>('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export function registerUser(payload: RegisterRequest) {
  return request<AuthSession>('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export function getCurrentSession() {
  return request<AuthSession>('/api/auth/me');
}

export function logout() {
  return request<{ loggedOut: boolean }>('/api/auth/logout', {
    method: 'POST',
  });
}

export function getCatalog(params?: {
  q?: string;
  category?: string;
  country?: string;
}) {
  const search = new URLSearchParams();

  if (params?.q) search.set('q', params.q);
  if (params?.category) search.set('category', params.category);
  if (params?.country) search.set('country', params.country);

  const query = search.toString();
  return request<CatalogResponse>(`/api/catalog${query ? `?${query}` : ''}`);
}

export function getAircraftList() {
  return request<AircraftRecord[]>('/api/aircraft');
}

export function getAircraftDetail(id: string) {
  return request<AircraftRecord & {
    relatedEvents: AviationEventRecord[];
    relatedExperts: AviationExpertRecord[];
  }>(`/api/aircraft/${id}`);
}

export function getEventDetail(id: string) {
  return request<AviationEventRecord & {
    relatedAircraft: AircraftRecord[];
  }>(`/api/events/${id}`);
}

export function getExpertDetail(id: string) {
  return request<AviationExpertRecord & {
    representativeAircraft: AircraftRecord[];
  }>(`/api/experts/${id}`);
}

export function uploadImage(dataUrl: string, fileName: string) {
  return request<{ imageUrl: string; filename: string }>('/api/uploads/image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ dataUrl, fileName }),
  });
}

export function createAircraft(payload: CreateAircraftRequest) {
  return request<AircraftRecord>('/api/aircraft', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export function deleteAircraft(id: string) {
  return request<AircraftRecord>(`/api/aircraft/${id}`, {
    method: 'DELETE',
  });
}
