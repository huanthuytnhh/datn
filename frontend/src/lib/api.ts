const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("dg_token");
}

async function req<T>(
  path: string,
  init: RequestInit = {},
  bearer?: string | null
): Promise<T> {
  const token = bearer !== undefined ? bearer : getToken();
  const isForm = init.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(!isForm ? { "Content-Type": "application/json" } : {}),
    ...(init.headers as Record<string, string>),
  };
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (res.status === 204) return undefined as T;
  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail ?? `HTTP ${res.status}`);
  return data as T;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export interface TokenResponse { access_token: string; token_type: string }
export interface UserOut {
  id: string; email: string; name: string; role: string;
  tenant_id: string; is_active: boolean; last_login_at: string | null;
}
export interface TenantOut {
  id: string; name: string; plan: string; status: string;
  monthly_quota: number; current_usage: number; admin_email: string;
}
export interface MeResponse { user: UserOut; tenant: TenantOut }

export const authLogin = (email: string, password: string) =>
  req<TokenResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const authRegister = (tenant_name: string, email: string, password: string, name: string) =>
  req<TokenResponse>("/auth/register", { method: "POST", body: JSON.stringify({ tenant_name, email, password, name }) });

export const authMe = () => req<MeResponse>("/auth/me");

// ── API Keys ─────────────────────────────────────────────────────────────────
export interface ApiKeyOut {
  id: string; name: string; prefix: string; status: string;
  quota_limit: number; quota_used: number; rate_limit_rpm: number;
  last_used_at: string | null; expires_at: string | null; created_at: string;
}
export interface ApiKeyCreated extends ApiKeyOut { plain_key: string }

export const apiKeysList = () => req<ApiKeyOut[]>("/api-keys");
export const apiKeysCreate = (name: string, quota_limit: number, rate_limit_rpm: number) =>
  req<ApiKeyCreated>("/api-keys", { method: "POST", body: JSON.stringify({ name, quota_limit, rate_limit_rpm }) });
export const apiKeysRevoke = (id: string) =>
  req<void>(`/api-keys/${id}`, { method: "DELETE" });

// ── Detections ───────────────────────────────────────────────────────────────
export interface DetectionListItem {
  request_id: string; verdict: string; confidence: number; prob_fake: number;
  processing_time_ms: number; model_version: string; image_hash: string; created_at: string;
}
export interface Paginated<T> { items: T[]; total: number; page: number; limit: number }

export const detectionsList = (params?: {
  verdict?: string; page?: number; limit?: number;
  start_date?: string; end_date?: string;
}) => {
  const qs = new URLSearchParams();
  if (params?.verdict) qs.set("verdict", params.verdict);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.start_date) qs.set("start_date", params.start_date);
  if (params?.end_date) qs.set("end_date", params.end_date);
  return req<Paginated<DetectionListItem>>(`/detections?${qs}`);
};

// ── Analytics ────────────────────────────────────────────────────────────────
export interface AnalyticsOverview {
  total_requests: number; fake_detected: number; real_detected: number;
  uncertain: number; fake_rate: number; avg_latency_ms: number;
  p95_latency_ms: number; days: number;
}
export interface UsageInfo {
  monthly_quota: number; current_usage: number; remaining: number; usage_percent: number;
}

export const analyticsOverview = (days = 30) =>
  req<AnalyticsOverview>(`/analytics/overview?days=${days}`);
export const analyticsUsage = () => req<UsageInfo>("/analytics/usage");

// ── Detect (uses API key, not JWT) ───────────────────────────────────────────
export interface DetectionResponse {
  request_id: string; verdict: string; confidence: number; prob_fake: number;
  prob_cnn: number; spatial_score: number | null; frequency_score: number | null;
  threshold_used: number; face_detected: boolean; processing_time_ms: number;
  model_version: string; image_width: number | null; image_height: number | null;
  created_at: string;
}

export const detectImage = (file: File, apiKey: string, threshold?: number) => {
  const form = new FormData();
  form.append("file", file);
  const qs = threshold != null ? `?threshold=${threshold}` : "";
  return req<DetectionResponse>(`/v1/detect/image${qs}`, { method: "POST", body: form }, apiKey);
};

export const detectGetResult = (requestId: string, apiKey: string) =>
  req<DetectionResponse>(`/v1/results/${requestId}`, {}, apiKey);

// ── Webhooks ─────────────────────────────────────────────────────────────────
export interface WebhookOut {
  id: string; url: string; events: string[]; status: string;
  last_delivery_at: string | null; last_delivery_status: number | null;
  created_at: string;
}

export const webhooksList = () => req<WebhookOut[]>("/webhooks");
export const webhooksCreate = (url: string, events: string[], secret?: string) =>
  req<WebhookOut>("/webhooks", { method: "POST", body: JSON.stringify({ url, events, secret }) });
export const webhooksUpdate = (id: string, data: { url?: string; events?: string[]; status?: string }) =>
  req<WebhookOut>(`/webhooks/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const webhooksDelete = (id: string) =>
  req<void>(`/webhooks/${id}`, { method: "DELETE" });
