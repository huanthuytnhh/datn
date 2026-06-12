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
  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("dg_token");
      window.dispatchEvent(new CustomEvent("dg:session-expired"));
    }
    throw new Error(data?.detail ?? `HTTP ${res.status}`);
  }
  return data as T;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export interface TokenResponse { access_token: string; token_type: string }
export interface UserOut {
  id: string; email: string; name: string; role: string;
  tenant_id: string; is_active: boolean; last_login_at: string | null;
  phone?: string | null; timezone?: string | null;
  must_change_password?: boolean;
}
export interface TenantOut {
  id: string; name: string; plan: string; status: string;
  monthly_quota: number; current_usage: number; admin_email: string;
}
export interface MeResponse { user: UserOut; tenant: TenantOut }

export const authLogin = (email: string, password: string) =>
  req<TokenResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

export interface RegisterPendingResponse { status: string; message: string; tenant_id: string }
export const authRegister = (tenant_name: string, email: string, password: string, name: string) =>
  req<RegisterPendingResponse>("/auth/register", { method: "POST", body: JSON.stringify({ tenant_name, email, password, name }) });

// ── Accept-invite (public, dùng token; không cần JWT) ──
export interface InviteInfo { valid: boolean; email?: string; role?: string; tenant_name?: string; reason?: string }
export const authInviteInfo = (token: string) =>
  req<InviteInfo>(`/auth/accept-invite?token=${encodeURIComponent(token)}`, {}, null);
export const authAcceptInvite = (token: string, name: string, password: string) =>
  req<TokenResponse>("/auth/accept-invite", { method: "POST", body: JSON.stringify({ token, name, password }) }, null);

export const authMe = () => req<MeResponse>("/auth/me");

// ── Health (public, không cần auth) ──
export const apiHealth = () => req<{ status: string; version: string }>("/health", {}, null);

export const authUpdateMe = (data: { name?: string; phone?: string; timezone?: string }) =>
  req<UserOut>("/auth/me", { method: "PATCH", body: JSON.stringify(data) });

export const authChangePassword = (current_password: string, new_password: string) =>
  req<void>("/auth/change-password", { method: "POST", body: JSON.stringify({ current_password, new_password }) });

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
  source?: string; // 'api' | 'playground'
}
export interface Paginated<T> { items: T[]; total: number; page: number; limit: number }

export const detectionsList = (params?: {
  verdict?: string; page?: number; limit?: number;
  start_date?: string; end_date?: string; api_key_id?: string;
}) => {
  const qs = new URLSearchParams();
  if (params?.verdict) qs.set("verdict", params.verdict);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.start_date) qs.set("start_date", params.start_date);
  if (params?.end_date) qs.set("end_date", params.end_date);
  if (params?.api_key_id) qs.set("api_key_id", params.api_key_id);
  return req<Paginated<DetectionListItem>>(`/detections?${qs}`);
};

export interface AuditNote {
  note: string; author_email: string; author_id: string; created_at: string;
}
export interface DetectionDetail {
  request_id: string; verdict: string; confidence: number; prob_fake: number;
  prob_cnn: number; spatial_score: number | null; frequency_score: number | null;
  threshold_used: number; image_hash: string;
  image_width: number | null; image_height: number | null;
  image_thumb: string | null;
  heatmap_url: string | null;
  processing_time_ms: number; model_version: string;
  user_agent: string | null; ip_address: string | null;
  audit_notes: AuditNote[]; created_at: string;
  api_key_id: string; api_key_prefix: string | null; api_key_name: string | null;
  tenant_name: string | null;
}

export const detectionsGet = (requestId: string) =>
  req<DetectionDetail>(`/detections/${requestId}`);

export const detectionsAddNote = (requestId: string, note: string) =>
  req<DetectionDetail>(`/detections/${requestId}/notes`, {
    method: "POST", body: JSON.stringify({ note }),
  });

// ── Audit logs ───────────────────────────────────────────────────────────────
export interface AuditLogItem {
  id: number;
  action: string;
  resource_type: string;
  resource_id: string | null;
  user_id: string | null;
  user_email: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// ── Liveness (anti-spoofing) ─────────────────────────────────────────────────
export interface LivenessResponse {
  check_id: string;
  verdict: string;                  // LIVE | SPOOF | UNCERTAIN
  liveness_score: number;           // 0-1
  confidence: number;               // 0-100
  spoof_type: string | null;        // print | screen | mask_3d | deepfake | unknown
  threshold_used: number;
  mode: string;                     // passive | active
  challenge_type: string | null;
  challenge_passed: boolean | null;
  frame_count: number;
  processing_time_ms: number;
  model_version: string;
  image_width: number | null;
  image_height: number | null;
  created_at: string;
}

export interface LivenessDetail extends LivenessResponse {
  image_thumb: string | null;
  image_hash: string;
  ip_address: string | null;
  user_agent: string | null;
  api_key_id: string;
  api_key_prefix: string | null;
  api_key_name: string | null;
  tenant_name: string | null;
}

export interface LivenessChallenge {
  challenge_id: string;
  challenge_type: string;
  instructions: string;
  expires_at: string;
}

export const detectLivenessPassive = (file: File, apiKey: string) => {
  const form = new FormData();
  form.append("file", file);
  return req<LivenessResponse>("/v1/detect/liveness", { method: "POST", body: form }, apiKey);
};

export const livenessGetChallenge = (apiKey: string) =>
  req<LivenessChallenge>("/v1/liveness/challenge", {}, apiKey);

export const detectLivenessActive = (
  frames: File[],
  challengeType: string,
  challengePassed: boolean,
  apiKey: string,
) => {
  const form = new FormData();
  for (const f of frames) form.append("files", f);
  form.append("challenge_type", challengeType);
  form.append("challenge_passed", String(challengePassed));
  return req<LivenessResponse>("/v1/detect/liveness/active", { method: "POST", body: form }, apiKey);
};

export interface LivenessListItem {
  check_id: string;
  verdict: string;
  liveness_score: number;
  confidence: number;
  spoof_type: string | null;
  mode: string;
  processing_time_ms: number;
  model_version: string;
  created_at: string;
}

export const livenessList = (params?: {
  verdict?: string; mode?: string; page?: number; limit?: number;
}) => {
  const qs = new URLSearchParams();
  if (params?.verdict) qs.set("verdict", params.verdict);
  if (params?.mode) qs.set("mode", params.mode);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  return req<Paginated<LivenessListItem>>(`/liveness?${qs}`);
};

export const livenessGet = (checkId: string) =>
  req<LivenessDetail>(`/liveness/${checkId}`);

// ── Audit ────────────────────────────────────────────────────────────────────
export const auditLogsList = (params?: {
  action?: string; resource_type?: string;
  start_date?: string; end_date?: string;
  page?: number; limit?: number;
}) => {
  const qs = new URLSearchParams();
  if (params?.action) qs.set("action", params.action);
  if (params?.resource_type) qs.set("resource_type", params.resource_type);
  if (params?.start_date) qs.set("start_date", params.start_date);
  if (params?.end_date) qs.set("end_date", params.end_date);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  return req<Paginated<AuditLogItem>>(`/audit-logs?${qs}`);
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
  request_id: string;
  // ── Tín hiệu rủi ro (định vị eKYC — khách dùng cái này) ──
  risk_score: number;                              // P(deepfake) đã calibrate ∈ [0,1]
  risk_band: "low" | "medium" | "high" | string;   // band theo ngưỡng per-tenant
  decision_hint: "pass" | "review" | "reject" | string;  // GỢI Ý, không phải quyết định cuối
  thresholds?: { low?: number; high?: number };    // ngưỡng band đang dùng
  // ── Giải thích trực quan ──
  heatmap?: string | null;     // Grad-CAM overlay (base64 data URL) — vùng nghi vấn
  frequency?: string | null;   // phổ log|2D-DCT| (base64 data URL) — bằng chứng tần số
  // ── Tương thích ngược + chi tiết ──
  verdict: string; confidence: number; prob_fake: number;
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

export interface FrameResult { frame_id: number; prob_fake: number; thumb?: string }
export interface VideoDetectionResponse {
  job_id: string; verdict: string; confidence: number; prob_fake: number;
  frames_analyzed: number; frames_fake: number; frame_results: FrameResult[];
  model_version: string; processing_time_ms: number; created_at: string;
}

export const detectVideo = (file: File, apiKey: string, sampleRate = 3) => {
  const form = new FormData();
  form.append("file", file);
  return req<VideoDetectionResponse>(`/v1/detect/video?sample_rate=${sampleRate}`, { method: "POST", body: form }, apiKey);
};

// ── Playground (JWT, dashboard) — KHÔNG cần API key; dùng cho test nhanh sau login ──
export const playgroundDetectImage = (file: File, threshold?: number, includeHeatmap = true) => {
  const form = new FormData();
  form.append("file", file);
  const params = new URLSearchParams();
  if (threshold != null) params.set("threshold", String(threshold));
  if (!includeHeatmap) params.set("include_heatmap", "false");
  const qs = params.size ? `?${params}` : "";
  return req<DetectionResponse>(`/playground/detect/image${qs}`, { method: "POST", body: form });
};
export const playgroundDetectVideo = (file: File, sampleRate = 3) => {
  const form = new FormData();
  form.append("file", file);
  return req<VideoDetectionResponse>(`/playground/detect/video?sample_rate=${sampleRate}`, { method: "POST", body: form });
};

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

// ── API Keys: update / get (PATCH + GET {id} already exist on backend) ────────
export const apiKeysUpdate = (
  id: string,
  data: { name?: string; quota_limit?: number; rate_limit_rpm?: number; status?: string },
) => req<ApiKeyOut>(`/api-keys/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const apiKeysGet = (id: string) => req<ApiKeyOut>(`/api-keys/${id}`);

// ── Users / Team (backend /users already exists; admin-gated) ─────────────────
export interface UserListItem {
  id: string; email: string; name: string; role: string;
  is_active: boolean; last_login_at: string | null; created_at: string;
}
export interface UserListResponse { items: UserListItem[]; total: number }
export interface InviteUserResponse {
  invitation_id: string; email: string; role: string;
  token: string; expires_at: string; invite_url: string;
}

export const usersList = () => req<UserListResponse>("/users");
export const usersCreate = (email: string, name: string, role: string, password: string) =>
  req<UserListItem>("/users", { method: "POST", body: JSON.stringify({ email, name, role, password }) });
export const usersInvite = (email: string, name: string, role: string) =>
  req<InviteUserResponse>("/users/invite", { method: "POST", body: JSON.stringify({ email, name, role }) });
export const usersResetPassword = (id: string) =>
  req<{ temp_password: string; must_change_password: boolean }>(`/users/${id}/reset-password`, { method: "POST" });
export const usersUpdate = (id: string, data: { name?: string; role?: string; is_active?: boolean }) =>
  req<UserListItem>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const usersDelete = (id: string) => req<void>(`/users/${id}`, { method: "DELETE" });

// ── Tenant (current) — GET/PATCH /tenant already exist ────────────────────────
export interface TenantInfo {
  id: string; name: string; plan: string; status: string;
  monthly_quota: number; current_usage: number;
  admin_email: string; billing_email: string | null; created_at: string;
}
export const tenantGet = () => req<TenantInfo>("/tenant");
export const tenantUpdate = (data: { name?: string; billing_email?: string; metadata?: Record<string, unknown> }) =>
  req<TenantInfo>("/tenant", { method: "PATCH", body: JSON.stringify(data) });

// ── Platform admin (sysadmin, cross-tenant) — backend endpoints to be added ───
export interface TenantListItem {
  id: string; name: string; plan: string; status: string;
  monthly_quota: number; current_usage: number; user_count: number; created_at: string;
}
export interface PlatformOverview {
  total_tenants: number; active_tenants: number; total_users: number;
  total_requests: number; fake_detected: number; fake_rate: number;
  avg_latency_ms: number;
}
export const tenantsList = () => req<Paginated<TenantListItem>>("/tenants");
export interface CreateTenantResponse { tenant: TenantListItem; admin_email: string; temp_password: string }
export const tenantsCreate = (data: {
  name: string; admin_email: string; admin_name?: string; plan?: string; monthly_quota?: number;
}) => req<CreateTenantResponse>("/tenants", { method: "POST", body: JSON.stringify(data) });
export const tenantUpdateById = (id: string, data: { status?: string; plan?: string; monthly_quota?: number }) =>
  req<TenantListItem>(`/tenants/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const platformOverview = (days = 30) =>
  req<PlatformOverview>(`/platform/overview?days=${days}`);

// sysadmin cross-tenant drill-down: users + api keys of a specific tenant
export interface TenantUserItem {
  id: string; email: string; name: string; role: string;
  is_active: boolean; last_login_at: string | null; created_at: string;
}
export interface TenantApiKeyItem {
  id: string; name: string; prefix: string; status: string;
  quota_limit: number; quota_used: number; rate_limit_rpm: number;
  last_used_at: string | null; created_at: string;
}
export const tenantUsers = (id: string) => req<TenantUserItem[]>(`/tenants/${id}/users`);
export const tenantApiKeys = (id: string) => req<TenantApiKeyItem[]>(`/tenants/${id}/api-keys`);
export const tenantUserUpdate = (tenantId: string, userId: string, data: { role?: string; is_active?: boolean }) =>
  req<TenantUserItem>(`/tenants/${tenantId}/users/${userId}`, { method: "PATCH", body: JSON.stringify(data) });

// ── Models & Thresholds (backed by model_versions table) ──────────────────────
export interface ModelOut {
  id: string; version: string; architecture: string;
  auc_celeb: number | null; auc_ffpp: number | null;
  threshold: number; training_dataset: string | null;
  is_active: boolean; traffic_percent: number;
  deployed_at: string | null; created_at: string;
}
export const modelsList = () => req<ModelOut[]>("/models");
export const modelUpdate = (id: string, data: { threshold?: number; is_active?: boolean; traffic_percent?: number }) =>
  req<ModelOut>(`/models/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const modelsCheckUpdate = () =>
  req<{ status: string; latest_version: string | null; message: string }>("/models/check-update", { method: "POST" });

// ── Notifications ─────────────────────────────────────────────────────────────
export interface NotificationOut {
  id: string; type: string; title: string;
  body: string | null; link: string | null; read: boolean; created_at: string;
}
export interface NotificationListResponse { items: NotificationOut[]; total: number; unread: number }

export const notificationsList = (params?: { unread_only?: boolean; limit?: number }) => {
  const qs = new URLSearchParams();
  if (params?.unread_only) qs.set("unread_only", "true");
  if (params?.limit) qs.set("limit", String(params.limit));
  return req<NotificationListResponse>(`/notifications?${qs}`);
};
export const notificationMarkRead = (id: string) =>
  req<NotificationOut>(`/notifications/${id}/read`, { method: "PATCH" });
export const notificationsReadAll = () =>
  req<void>("/notifications/read-all", { method: "POST" });
export const notificationDelete = (id: string) =>
  req<void>(`/notifications/${id}`, { method: "DELETE" });
