'use client';

import { useMemo, useState } from 'react';
import { useNavigation, type Page } from '@/store/navigation';
import { Icon, CodeBlock, RangeToggle } from '@/components/deepguard/shared';
import { DG } from '@/lib/dg';
import { PAGE_ACCESS, ROLE_LABEL, canAccess, canEdit, ALL_ROLES, type Role } from '@/lib/rbac';

/* ──────────────────────────────────────────────
   DeepGuard — Documentation Hub (static)
   3 sections: Bắt đầu · Theo vai trò · API Reference.
   The API Reference is the original endpoint explorer
   (endpoints reflect the real client in @/lib/api.ts).
   ────────────────────────────────────────────── */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
type AuthKind = 'API Key' | 'Bearer JWT' | 'Public';

interface Param {
  name: string;
  in: 'form-data' | 'query' | 'body' | 'path';
  type: string;
  req: boolean;
  desc: string;
}

interface Endpoint {
  id: string;
  method: Method;
  path: string;
  group: string;
  summary: string;
  auth: AuthKind;
  params: Param[];
  response: Record<string, unknown> | unknown[];
}

const METHOD_STYLE: Record<Method, { color: string; bg: string; border: string }> = {
  GET: { color: DG.primary, bg: '#eff6ff', border: '#bfdbfe' },
  POST: { color: DG.real, bg: '#f0fdf4', border: '#bbf7d0' },
  PUT: { color: DG.uncertain, bg: '#fff7ed', border: '#fed7aa' },
  DELETE: { color: DG.fake, bg: '#fef2f2', border: '#fecaca' },
};

const AUTH_HEADER: Record<AuthKind, string> = {
  'API Key': 'X-API-Key: dg_live_…',
  'Bearer JWT': 'Authorization: Bearer <token>',
  Public: 'Không yêu cầu',
};

/* ── Real endpoints, derived from src/lib/api.ts ── */
const ENDPOINTS: Endpoint[] = [
  /* Auth */
  {
    id: 'auth-login',
    method: 'POST',
    path: '/auth/login',
    group: 'Authentication',
    summary: 'Đăng nhập, trả về JWT access token',
    auth: 'Public',
    params: [
      { name: 'email', in: 'body', type: 'string', req: true, desc: 'Email tài khoản' },
      { name: 'password', in: 'body', type: 'string', req: true, desc: 'Mật khẩu' },
    ],
    response: { access_token: 'eyJhbGciOi…', token_type: 'bearer' },
  },
  {
    id: 'auth-register',
    method: 'POST',
    path: '/auth/register',
    group: 'Authentication',
    summary: 'Đăng ký tenant + tài khoản admin',
    auth: 'Public',
    params: [
      { name: 'tenant_name', in: 'body', type: 'string', req: true, desc: 'Tên tổ chức' },
      { name: 'email', in: 'body', type: 'string', req: true, desc: 'Email admin' },
      { name: 'password', in: 'body', type: 'string', req: true, desc: 'Mật khẩu' },
      { name: 'name', in: 'body', type: 'string', req: true, desc: 'Tên hiển thị' },
    ],
    response: { access_token: 'eyJhbGciOi…', token_type: 'bearer' },
  },
  {
    id: 'auth-me',
    method: 'GET',
    path: '/auth/me',
    group: 'Authentication',
    summary: 'Thông tin user + tenant hiện tại',
    auth: 'Bearer JWT',
    params: [],
    response: {
      user: { id: 'u_91', email: 'admin@vietbank.vn', name: 'Nguyễn Văn A', role: 'admin', tenant_id: 't_01', is_active: true, last_login_at: '2026-05-29T08:12:00Z' },
      tenant: { id: 't_01', name: 'VietBank', plan: 'pro', status: 'active', monthly_quota: 50000, current_usage: 12847, admin_email: 'admin@vietbank.vn' },
    },
  },

  /* Detection (API Key) */
  {
    id: 'detect-image',
    method: 'POST',
    path: '/v1/detect/image',
    group: 'Detection',
    summary: 'Phát hiện deepfake trong ảnh',
    auth: 'API Key',
    params: [
      { name: 'file', in: 'form-data', type: 'file', req: true, desc: 'Ảnh JPG/PNG/WEBP' },
      { name: 'threshold', in: 'query', type: 'float', req: false, desc: 'Ngưỡng fake (0–1), mặc định 0.35' },
    ],
    response: {
      request_id: 'req_a8f2c1',
      verdict: 'FAKE',
      confidence: 94.1,
      prob_fake: 0.941,
      prob_cnn: 0.948,
      spatial_score: 0.872,
      frequency_score: 0.901,
      threshold_used: 0.35,
      face_detected: true,
      processing_time_ms: 132,
      model_version: 'v2.1.3',
      image_width: 256,
      image_height: 256,
      created_at: '2026-05-29T08:12:00Z',
    },
  },
  {
    id: 'detect-video',
    method: 'POST',
    path: '/v1/detect/video',
    group: 'Detection',
    summary: 'Phát hiện deepfake trong video (per-frame)',
    auth: 'API Key',
    params: [
      { name: 'file', in: 'form-data', type: 'file', req: true, desc: 'Video MP4/WEBM' },
      { name: 'sample_rate', in: 'query', type: 'int', req: false, desc: 'Lấy mẫu mỗi N frame, mặc định 3' },
    ],
    response: {
      job_id: 'job_91xk',
      verdict: 'FAKE',
      confidence: 88.6,
      prob_fake: 0.886,
      frames_analyzed: 42,
      frames_fake: 18,
      frame_results: [{ frame_id: 12, prob_fake: 0.93 }],
      model_version: 'v2.1.3',
      processing_time_ms: 4120,
      created_at: '2026-05-29T08:12:00Z',
    },
  },
  {
    id: 'detect-result',
    method: 'GET',
    path: '/v1/results/{request_id}',
    group: 'Detection',
    summary: 'Lấy lại kết quả phát hiện theo request_id',
    auth: 'API Key',
    params: [{ name: 'request_id', in: 'path', type: 'string', req: true, desc: 'ID request trả về khi detect' }],
    response: { request_id: 'req_a8f2c1', verdict: 'FAKE', confidence: 94.1, prob_fake: 0.941, model_version: 'v2.1.3' },
  },

  /* Liveness (API Key) */
  {
    id: 'detect-liveness',
    method: 'POST',
    path: '/v1/detect/liveness',
    group: 'Liveness',
    summary: 'Kiểm tra liveness thụ động (passive)',
    auth: 'API Key',
    params: [{ name: 'file', in: 'form-data', type: 'file', req: true, desc: 'Ảnh selfie' }],
    response: {
      check_id: 'chk_77a2',
      verdict: 'LIVE',
      liveness_score: 0.97,
      confidence: 96.4,
      spoof_type: null,
      threshold_used: 0.5,
      mode: 'passive',
      frame_count: 1,
      processing_time_ms: 88,
      model_version: 'v1.4.0',
      created_at: '2026-05-29T08:12:00Z',
    },
  },
  {
    id: 'liveness-challenge',
    method: 'GET',
    path: '/v1/liveness/challenge',
    group: 'Liveness',
    summary: 'Cấp challenge cho liveness chủ động (active)',
    auth: 'API Key',
    params: [],
    response: { challenge_id: 'cha_55b1', challenge_type: 'turn_head', instructions: 'Quay đầu sang phải', expires_at: '2026-05-29T08:14:00Z' },
  },
  {
    id: 'detect-liveness-active',
    method: 'POST',
    path: '/v1/detect/liveness/active',
    group: 'Liveness',
    summary: 'Kiểm tra liveness chủ động theo chuỗi frame',
    auth: 'API Key',
    params: [
      { name: 'files', in: 'form-data', type: 'file[]', req: true, desc: 'Chuỗi frame selfie' },
      { name: 'challenge_type', in: 'form-data', type: 'string', req: true, desc: 'Loại challenge đã cấp' },
      { name: 'challenge_passed', in: 'form-data', type: 'bool', req: true, desc: 'Người dùng đã thực hiện đúng challenge' },
    ],
    response: {
      check_id: 'chk_88c3',
      verdict: 'LIVE',
      liveness_score: 0.98,
      confidence: 97.8,
      spoof_type: null,
      mode: 'active',
      challenge_type: 'turn_head',
      challenge_passed: true,
      frame_count: 6,
      processing_time_ms: 240,
      model_version: 'v1.4.0',
      created_at: '2026-05-29T08:12:00Z',
    },
  },

  /* Data (Bearer JWT) */
  {
    id: 'list-detections',
    method: 'GET',
    path: '/detections',
    group: 'Data',
    summary: 'Danh sách lịch sử phát hiện (phân trang)',
    auth: 'Bearer JWT',
    params: [
      { name: 'verdict', in: 'query', type: 'string', req: false, desc: 'Lọc: REAL | FAKE | UNCERTAIN' },
      { name: 'api_key_id', in: 'query', type: 'string', req: false, desc: 'Lọc theo API key' },
      { name: 'start_date', in: 'query', type: 'string', req: false, desc: 'Từ ngày (ISO)' },
      { name: 'end_date', in: 'query', type: 'string', req: false, desc: 'Đến ngày (ISO)' },
      { name: 'page', in: 'query', type: 'int', req: false, desc: 'Trang, mặc định 1' },
      { name: 'limit', in: 'query', type: 'int', req: false, desc: 'Số bản ghi/trang' },
    ],
    response: {
      items: [{ request_id: 'req_a8f2c1', verdict: 'FAKE', confidence: 94.1, prob_fake: 0.941, processing_time_ms: 132, model_version: 'v2.1.3', image_hash: 'a8f2…', created_at: '2026-05-29T08:12:00Z' }],
      total: 12847,
      page: 1,
      limit: 20,
    },
  },
  {
    id: 'get-detection',
    method: 'GET',
    path: '/detections/{request_id}',
    group: 'Data',
    summary: 'Chi tiết một lần phát hiện',
    auth: 'Bearer JWT',
    params: [{ name: 'request_id', in: 'path', type: 'string', req: true, desc: 'ID request' }],
    response: {
      request_id: 'req_a8f2c1',
      verdict: 'FAKE',
      confidence: 94.1,
      prob_fake: 0.941,
      prob_cnn: 0.948,
      spatial_score: 0.872,
      frequency_score: 0.901,
      threshold_used: 0.35,
      image_hash: 'a8f2…',
      heatmap_url: '/static/heatmaps/req_a8f2c1.png',
      processing_time_ms: 132,
      model_version: 'v2.1.3',
      audit_notes: [],
      created_at: '2026-05-29T08:12:00Z',
    },
  },
  {
    id: 'add-note',
    method: 'POST',
    path: '/detections/{request_id}/notes',
    group: 'Data',
    summary: 'Thêm ghi chú audit cho một lần phát hiện',
    auth: 'Bearer JWT',
    params: [
      { name: 'request_id', in: 'path', type: 'string', req: true, desc: 'ID request' },
      { name: 'note', in: 'body', type: 'string', req: true, desc: 'Nội dung ghi chú' },
    ],
    response: { request_id: 'req_a8f2c1', verdict: 'FAKE', audit_notes: [{ note: 'Đã xác nhận face-swap.', author_email: 'analyst@vietbank.vn', author_id: 'u_91', created_at: '2026-05-29T08:20:00Z' }] },
  },
  {
    id: 'list-liveness',
    method: 'GET',
    path: '/liveness',
    group: 'Data',
    summary: 'Danh sách lịch sử liveness (phân trang)',
    auth: 'Bearer JWT',
    params: [
      { name: 'verdict', in: 'query', type: 'string', req: false, desc: 'Lọc: LIVE | SPOOF | UNCERTAIN' },
      { name: 'mode', in: 'query', type: 'string', req: false, desc: 'Lọc: passive | active' },
      { name: 'page', in: 'query', type: 'int', req: false, desc: 'Trang, mặc định 1' },
      { name: 'limit', in: 'query', type: 'int', req: false, desc: 'Số bản ghi/trang' },
    ],
    response: {
      items: [{ check_id: 'chk_77a2', verdict: 'LIVE', liveness_score: 0.97, confidence: 96.4, spoof_type: null, mode: 'passive', processing_time_ms: 88, model_version: 'v1.4.0', created_at: '2026-05-29T08:12:00Z' }],
      total: 3204,
      page: 1,
      limit: 20,
    },
  },
  {
    id: 'get-liveness',
    method: 'GET',
    path: '/liveness/{check_id}',
    group: 'Data',
    summary: 'Chi tiết một lần kiểm tra liveness',
    auth: 'Bearer JWT',
    params: [{ name: 'check_id', in: 'path', type: 'string', req: true, desc: 'ID check' }],
    response: { check_id: 'chk_77a2', verdict: 'LIVE', liveness_score: 0.97, confidence: 96.4, mode: 'passive', image_hash: '77a2…', api_key_name: 'Production Web', created_at: '2026-05-29T08:12:00Z' },
  },
  {
    id: 'audit-logs',
    method: 'GET',
    path: '/audit-logs',
    group: 'Data',
    summary: 'Nhật ký audit của tenant (phân trang)',
    auth: 'Bearer JWT',
    params: [
      { name: 'action', in: 'query', type: 'string', req: false, desc: 'Lọc theo hành động' },
      { name: 'resource_type', in: 'query', type: 'string', req: false, desc: 'Lọc theo loại tài nguyên' },
      { name: 'start_date', in: 'query', type: 'string', req: false, desc: 'Từ ngày (ISO)' },
      { name: 'end_date', in: 'query', type: 'string', req: false, desc: 'Đến ngày (ISO)' },
      { name: 'page', in: 'query', type: 'int', req: false, desc: 'Trang, mặc định 1' },
      { name: 'limit', in: 'query', type: 'int', req: false, desc: 'Số bản ghi/trang' },
    ],
    response: {
      items: [{ id: 1041, action: 'api_key.create', resource_type: 'api_key', resource_id: 'k_91', user_email: 'admin@vietbank.vn', metadata: {}, ip_address: '14.169.1.2', created_at: '2026-05-29T08:12:00Z' }],
      total: 894,
      page: 1,
      limit: 20,
    },
  },
  {
    id: 'analytics-overview',
    method: 'GET',
    path: '/analytics/overview',
    group: 'Analytics',
    summary: 'Tổng quan analytics theo khoảng ngày',
    auth: 'Bearer JWT',
    params: [{ name: 'days', in: 'query', type: 'int', req: false, desc: 'Số ngày, mặc định 30' }],
    response: { total_requests: 12847, fake_detected: 342, real_detected: 12180, uncertain: 325, fake_rate: 2.7, avg_latency_ms: 142, p95_latency_ms: 187, days: 30 },
  },
  {
    id: 'analytics-usage',
    method: 'GET',
    path: '/analytics/usage',
    group: 'Analytics',
    summary: 'Hạn mức và mức sử dụng tháng hiện tại',
    auth: 'Bearer JWT',
    params: [],
    response: { monthly_quota: 50000, current_usage: 12847, remaining: 37153, usage_percent: 25.7 },
  },

  /* Management (Bearer JWT) */
  {
    id: 'list-keys',
    method: 'GET',
    path: '/api-keys',
    group: 'Management',
    summary: 'Danh sách API key của tenant',
    auth: 'Bearer JWT',
    params: [],
    response: [{ id: 'k_91', name: 'Production Web', prefix: 'dg_live_a91f…', status: 'active', quota_limit: 10000, quota_used: 6240, rate_limit_rpm: 200, last_used_at: '2026-05-29T08:09:00Z', expires_at: null, created_at: '2025-01-01T00:00:00Z' }],
  },
  {
    id: 'create-key',
    method: 'POST',
    path: '/api-keys',
    group: 'Management',
    summary: 'Tạo API key mới (plain_key chỉ trả 1 lần)',
    auth: 'Bearer JWT',
    params: [
      { name: 'name', in: 'body', type: 'string', req: true, desc: 'Tên gợi nhớ' },
      { name: 'quota_limit', in: 'body', type: 'int', req: true, desc: 'Hạn mức requests' },
      { name: 'rate_limit_rpm', in: 'body', type: 'int', req: true, desc: 'Giới hạn req/phút' },
    ],
    response: { id: 'k_91', name: 'Production', prefix: 'dg_live_a91f…', plain_key: 'dg_live_a91f8c2b…(once)', status: 'active', quota_limit: 10000, quota_used: 0, rate_limit_rpm: 200, created_at: '2026-05-29T08:12:00Z' },
  },
  {
    id: 'revoke-key',
    method: 'DELETE',
    path: '/api-keys/{id}',
    group: 'Management',
    summary: 'Thu hồi (revoke) một API key',
    auth: 'Bearer JWT',
    params: [{ name: 'id', in: 'path', type: 'string', req: true, desc: 'ID API key' }],
    response: {},
  },
  {
    id: 'list-webhooks',
    method: 'GET',
    path: '/webhooks',
    group: 'Management',
    summary: 'Danh sách webhook đã đăng ký',
    auth: 'Bearer JWT',
    params: [],
    response: [{ id: 'wh_01', url: 'https://hooks.vietbank.vn/dg', events: ['detection.completed'], status: 'active', last_delivery_at: '2026-05-29T08:00:00Z', last_delivery_status: 200, created_at: '2025-02-01T00:00:00Z' }],
  },
  {
    id: 'create-webhook',
    method: 'POST',
    path: '/webhooks',
    group: 'Management',
    summary: 'Đăng ký webhook nhận sự kiện',
    auth: 'Bearer JWT',
    params: [
      { name: 'url', in: 'body', type: 'string', req: true, desc: 'URL nhận callback' },
      { name: 'events', in: 'body', type: 'string[]', req: true, desc: 'Danh sách sự kiện đăng ký' },
      { name: 'secret', in: 'body', type: 'string', req: false, desc: 'Secret ký HMAC payload' },
    ],
    response: { id: 'wh_02', url: 'https://hooks.vietbank.vn/dg', events: ['detection.completed'], status: 'active', last_delivery_at: null, last_delivery_status: null, created_at: '2026-05-29T08:12:00Z' },
  },
  {
    id: 'update-webhook',
    method: 'PUT',
    path: '/webhooks/{id}',
    group: 'Management',
    summary: 'Cập nhật URL, sự kiện hoặc trạng thái webhook',
    auth: 'Bearer JWT',
    params: [
      { name: 'id', in: 'path', type: 'string', req: true, desc: 'ID webhook' },
      { name: 'url', in: 'body', type: 'string', req: false, desc: 'URL mới' },
      { name: 'events', in: 'body', type: 'string[]', req: false, desc: 'Danh sách sự kiện mới' },
      { name: 'status', in: 'body', type: 'string', req: false, desc: 'active | paused' },
    ],
    response: { id: 'wh_02', url: 'https://hooks.vietbank.vn/dg', events: ['detection.completed', 'liveness.completed'], status: 'paused', last_delivery_at: '2026-05-29T08:00:00Z', last_delivery_status: 200, created_at: '2025-02-01T00:00:00Z' },
  },
  {
    id: 'delete-webhook',
    method: 'DELETE',
    path: '/webhooks/{id}',
    group: 'Management',
    summary: 'Xoá một webhook',
    auth: 'Bearer JWT',
    params: [{ name: 'id', in: 'path', type: 'string', req: true, desc: 'ID webhook' }],
    response: {},
  },
];

const STATUS_CODES = [
  { code: 200, label: 'OK', desc: 'Request thành công', color: DG.real },
  { code: 204, label: 'No Content', desc: 'Thành công, không có nội dung trả về', color: DG.real },
  { code: 400, label: 'Bad Request', desc: 'Tham số không hợp lệ hoặc thiếu file', color: DG.uncertain },
  { code: 401, label: 'Unauthorized', desc: 'Token / API key sai hoặc thiếu', color: DG.fake },
  { code: 404, label: 'Not Found', desc: 'Tài nguyên không tồn tại', color: DG.uncertain },
  { code: 429, label: 'Too Many Requests', desc: 'Vượt rate limit RPM', color: DG.uncertain },
  { code: 500, label: 'Server Error', desc: 'Lỗi nội bộ — thử lại sau', color: DG.fake },
];

/* ──────────────────────────────────────────────
   Role-guide metadata (Section 2)
   PAGE_ACCESS / canAccess / canEdit from @/lib/rbac
   are the source of truth; this map only adds VN
   labels + one-line descriptions + icons per page.
   ────────────────────────────────────────────── */
interface PageMeta {
  label: string;
  desc: string;
  icon: string;
}

const PAGE_META: Record<Page, PageMeta> = {
  landing: { label: 'Trang giới thiệu', desc: 'Trang công khai giới thiệu nền tảng.', icon: 'public' },
  login: { label: 'Đăng nhập', desc: 'Xác thực email/mật khẩu để vào dashboard.', icon: 'login' },
  register: { label: 'Đăng ký', desc: 'Tạo tổ chức mới (chờ quản trị nền tảng duyệt).', icon: 'app_registration' },
  'accept-invite': { label: 'Chấp nhận lời mời', desc: 'Đặt mật khẩu cho tài khoản được mời vào tổ chức.', icon: 'how_to_reg' },
  dashboard: { label: 'Dashboard', desc: 'Bảng điều khiển tổng quan, hiển thị theo vai trò.', icon: 'dashboard' },
  account: { label: 'Tài khoản', desc: 'Hồ sơ cá nhân, đổi mật khẩu, bảo mật.', icon: 'person' },
  notifications: { label: 'Thông báo', desc: 'Cảnh báo hệ thống, hạn mức, sự kiện.', icon: 'notifications' },
  docs: { label: 'Tài liệu', desc: 'Hướng dẫn sử dụng + API reference (trang này).', icon: 'menu_book' },
  history: { label: 'Lịch sử', desc: 'Danh sách các lần phát hiện đã thực hiện.', icon: 'history' },
  detail: { label: 'Chi tiết phát hiện', desc: 'Verdict, score, heatmap & ghi chú điều tra.', icon: 'frame_inspect' },
  analytics: { label: 'Phân tích', desc: 'Biểu đồ lưu lượng, tỉ lệ fake, độ trễ.', icon: 'analytics' },
  status: { label: 'Trạng thái & Tuân thủ', desc: 'Sức khỏe hệ thống, chứng chỉ, retention.', icon: 'monitor_heart' },
  playground: { label: 'Playground', desc: 'Thử nhanh: upload ảnh/video → xem verdict/score/heatmap.', icon: 'science' },
  liveness: { label: 'Liveness (eKYC)', desc: 'Kiểm tra người thật/giả mạo cho định danh.', icon: 'face' },
  apikeys: { label: 'API Keys', desc: 'Tạo, xem & thu hồi khoá tích hợp dg_…', icon: 'key' },
  webhooks: { label: 'Webhooks', desc: 'Đăng ký callback nhận kết quả tự động.', icon: 'webhook' },
  models: { label: 'Models & Thresholds', desc: 'Phiên bản model, ngưỡng phán đoán, A/B traffic.', icon: 'model_training' },
  audit: { label: 'Audit Logs', desc: 'Nhật ký mọi hành vi để tra cứu & xuất.', icon: 'fact_check' },
  team: { label: 'Team & Roles', desc: 'Mời thành viên, gán vai trò trong tổ chức.', icon: 'group' },
  billing: { label: 'Billing & Usage', desc: 'Gói cước, hạn mức tháng & hoá đơn.', icon: 'receipt_long' },
  settings: { label: 'Settings', desc: 'Cấu hình tổ chức / nền tảng.', icon: 'settings' },
  tenants: { label: 'Quản lý Tenants', desc: 'Quản trị xuyên tổ chức: plan, quota, trạng thái.', icon: 'corporate_fare' },
};

interface RoleGuide {
  role: Role;
  icon: string;
  color: string;
  tagline: string;
  description: string;
  workflow: string[];
  can: string[];
  cannot: string[];
}

const ROLE_GUIDES: Record<Role, RoleGuide> = {
  sysadmin: {
    role: 'sysadmin',
    icon: 'admin_panel_settings',
    color: DG.fake,
    tagline: 'DeepGuard Ops · quản trị XUYÊN tenant',
    description:
      'Đội vận hành nền tảng DeepGuard. Quản trị toàn bộ hệ thống và mọi tenant: theo dõi sức khỏe, model, audit và cấu hình cấp nền tảng. Không can thiệp vào nghiệp vụ tích hợp của từng tenant.',
    workflow: [
      'Xem Platform Dashboard: tổng số tenant, mức sử dụng (usage) và tình trạng hệ thống (health).',
      'Quản lý Tenants: tạm ngưng / kích hoạt, đổi gói (plan), chỉnh quota cho từng tổ chức.',
      'Models & Thresholds: bật/tắt model, chỉnh ngưỡng phán đoán, phân bổ traffic A/B.',
      'Theo dõi Status & Audit Logs trên toàn hệ thống để đảm bảo tuân thủ.',
    ],
    can: [
      'Quản trị mọi tenant: plan, quota, tạm ngưng/kích hoạt.',
      'Cấu hình model & ngưỡng cấp nền tảng, chạy A/B.',
      'Xem Audit, Status, Analytics toàn hệ thống.',
      'Quản lý Team & Settings ở cấp nền tảng.',
    ],
    cannot: [
      'Không thao tác Playground / API Keys / Webhooks của tenant.',
      'Không quản lý Billing của tenant (đó là việc Tenant Admin).',
    ],
  },
  admin: {
    role: 'admin',
    icon: 'shield_person',
    color: DG.primary,
    tagline: 'Tenant Admin · quản trị tổ chức của mình',
    description:
      'Quản trị viên của một tổ chức (tenant). Toàn quyền trong phạm vi tổ chức: thành viên, khoá API, webhook, hạn mức, cấu hình và giám sát — nhưng chỉ trong tenant của mình.',
    workflow: [
      'Mời thành viên & gán vai trò trong trang Team & Roles.',
      'Tạo / thu hồi API Keys cho các hệ thống tích hợp.',
      'Theo dõi hạn mức (quota) & Billing của tổ chức.',
      'Cấu hình tổ chức trong Settings.',
      'Giám sát Dashboard / Analytics và soát Audit Logs.',
    ],
    can: [
      'Quản lý thành viên & vai trò trong tổ chức.',
      'Tạo/thu hồi API Keys, cấu hình Webhooks.',
      'Xem & quản lý Billing, quota của tenant.',
      'Dùng Playground, Liveness; xem Models/Status; soát Audit.',
    ],
    cannot: [
      'Không quản lý tenant khác (đó là việc System Admin).',
      'Không chỉnh model/ngưỡng cấp nền tảng.',
    ],
  },
  developer: {
    role: 'developer',
    icon: 'code',
    color: DG.real,
    tagline: 'Kỹ sư tích hợp',
    description:
      'Lập trình viên tích hợp DeepGuard vào sản phẩm. Tập trung vào API Keys, thử nghiệm ở Playground, tích hợp endpoint nhận diện và nhận kết quả qua Webhooks.',
    workflow: [
      'Lấy API Key trong trang API Keys (lưu lại ngay, key chỉ hiện 1 lần).',
      'Thử nhanh ở Playground: upload ảnh/video → xem verdict / score / heatmap.',
      'Tích hợp theo API Reference: POST /v1/detect/image, /v1/detect/video, /v1/detect/liveness.',
      'Cấu hình Webhooks để nhận kết quả tự động về hệ thống.',
      'Theo dõi History / Analytics để giám sát chất lượng tích hợp.',
    ],
    can: [
      'Tạo/thu hồi API Keys, cấu hình Webhooks.',
      'Dùng Playground & Liveness để thử nghiệm.',
      'Xem History, Analytics, Models (xem), Status (xem).',
    ],
    cannot: [
      'Không vào Team / Billing / Settings.',
      'Không vào Audit Logs / Tenants.',
    ],
  },
  compliance: {
    role: 'compliance',
    icon: 'gavel',
    color: DG.uncertain,
    tagline: 'Kiểm toán / Tuân thủ',
    description:
      'Cán bộ kiểm toán & tuân thủ. Soát các case nghi vấn, thêm ghi chú điều tra, tra cứu nhật ký audit và kiểm tra chứng chỉ/retention. Có thể xem & replay nhưng không chỉnh cấu hình.',
    workflow: [
      'Dashboard: xem hàng đợi các case FAKE cần soát.',
      'History → Detail: xem heatmap/score và THÊM ghi chú điều tra (notes).',
      'Audit Logs: tra cứu hành vi, lọc theo action / user / thời gian, export.',
      'Status & Compliance: kiểm tra chứng chỉ và chính sách lưu trữ (retention).',
    ],
    can: [
      'Xem Dashboard, History/Detail, Analytics, Status, Models (xem).',
      'Thêm ghi chú điều tra (notes) ở trang Chi tiết.',
      'Xem/replay ở Playground & Liveness.',
      'Tra cứu & export Audit Logs.',
    ],
    cannot: [
      'Không tạo/sửa API Keys, Webhooks.',
      'Không quản lý Team, Billing, Settings, Tenants.',
    ],
  },
  viewer: {
    role: 'viewer',
    icon: 'visibility',
    color: '#64748b',
    tagline: 'Chỉ xem · stakeholder / khách',
    description:
      'Người dùng chỉ-xem (lãnh đạo, khách, bên liên quan). Theo dõi số liệu & báo cáo nhưng không có bất kỳ thao tác hành động nào — mọi nút tạo/sửa/xóa đều bị ẩn hoặc vô hiệu hoá.',
    workflow: [
      'Xem Dashboard để nắm số liệu tổng quan.',
      'Xem History / Detail và Analytics để theo dõi báo cáo.',
      'Xem Status để biết tình trạng hệ thống.',
    ],
    can: [
      'Xem Dashboard, History/Detail, Analytics, Status.',
      'Xem Thông báo, Tài liệu, Tài khoản cá nhân.',
    ],
    cannot: [
      'Không thao tác gì (mọi nút tạo/sửa/xóa bị ẩn hoặc disabled).',
      'Không vào Playground / API Keys / Audit / khu vực quản trị.',
    ],
  },
};

const DEMO_ACCOUNTS: { email: string; role: Role; note: string }[] = [
  { email: 'sysadmin@deepguard.vn', role: 'sysadmin', note: 'DeepGuard Ops — quản trị nền tảng' },
  { email: 'admin@vietbank.vn', role: 'admin', note: 'Tenant Admin của VietBank' },
  { email: 'dev@vietbank.vn', role: 'developer', note: 'Kỹ sư tích hợp' },
  { email: 'compliance@vietbank.vn', role: 'compliance', note: 'Kiểm toán / tuân thủ' },
  { email: 'viewer@vietbank.vn', role: 'viewer', note: 'Chỉ xem' },
];

/* Pages shown in the role guide / matrix (exclude public landing/login). */
const GUIDE_PAGES: Page[] = [
  'dashboard',
  'playground',
  'liveness',
  'history',
  'detail',
  'analytics',
  'apikeys',
  'webhooks',
  'models',
  'audit',
  'status',
  'team',
  'billing',
  'settings',
  'tenants',
  'notifications',
  'docs',
  'account',
];

/** Access kind for a (role, page) pair, derived purely from rbac.ts. */
type AccessKind = 'edit' | 'view' | 'none';
function accessKind(role: Role, page: Page): AccessKind {
  if (!canAccess(role, page)) return 'none';
  return canEdit(role, page) ? 'edit' : 'view';
}

/* ── Code sample builder ── */
function endpointCode(ep: Endpoint, lang: 'curl' | 'python' | 'js'): string {
  const url = `${BASE_URL}${ep.path}`;
  const isForm = ep.params.some((p) => p.in === 'form-data');
  const auth =
    ep.auth === 'API Key' ? '-H "X-API-Key: dg_live_…"' : ep.auth === 'Bearer JWT' ? '-H "Authorization: Bearer <token>"' : '';
  const authHeaderObj =
    ep.auth === 'API Key' ? '"X-API-Key": "dg_live_a91f…"' : ep.auth === 'Bearer JWT' ? '"Authorization": "Bearer <token>"' : '';

  const bodyParams = ep.params.filter((p) => p.in === 'body');
  const jsonBody = bodyParams.length
    ? `{ ${bodyParams.map((p) => `"${p.name}": "…"`).join(', ')} }`
    : '';

  if (lang === 'curl') {
    if (isForm) {
      return `curl -X ${ep.method} "${url}" \\\n  ${auth} \\\n  -F "file=@target.jpg"`;
    }
    if (ep.method === 'GET' || ep.method === 'DELETE') {
      return `curl -X ${ep.method} "${url}" \\\n  ${auth}`;
    }
    return `curl -X ${ep.method} "${url}" \\\n  ${auth} \\\n  -H "Content-Type: application/json" \\\n  -d '${jsonBody}'`;
  }

  if (lang === 'python') {
    const headers = authHeaderObj ? `headers={${authHeaderObj}}` : '';
    if (isForm) {
      return `import requests\nr = requests.${ep.method.toLowerCase()}("${url}",\n  ${headers},\n  files={"file": open("target.jpg", "rb")})\nprint(r.json())`;
    }
    if (ep.method === 'GET' || ep.method === 'DELETE') {
      return `import requests\nr = requests.${ep.method.toLowerCase()}("${url}",\n  ${headers})\nprint(r.json())`;
    }
    return `import requests\nr = requests.${ep.method.toLowerCase()}("${url}",\n  ${headers},\n  json=${jsonBody || '{}'})\nprint(r.json())`;
  }

  // js
  const headerLines = [authHeaderObj].filter(Boolean).join(', ');
  if (isForm) {
    return `const fd = new FormData();\nfd.append("file", file);\nconst r = await fetch("${url}", {\n  method: "${ep.method}",\n  headers: { ${headerLines} },\n  body: fd,\n});\nconst data = await r.json();`;
  }
  if (ep.method === 'GET' || ep.method === 'DELETE') {
    return `const r = await fetch("${url}", {\n  method: "${ep.method}",\n  headers: { ${headerLines} },\n});\nconst data = await r.json();`;
  }
  const jsonHeaders = [headerLines, '"Content-Type": "application/json"'].filter(Boolean).join(', ');
  return `const r = await fetch("${url}", {\n  method: "${ep.method}",\n  headers: { ${jsonHeaders} },\n  body: JSON.stringify(${jsonBody || '{}'}),\n});\nconst data = await r.json();`;
}

/* ── Method tag ── */
function MethodTag({ method, sm }: { method: Method; sm?: boolean }) {
  const m = METHOD_STYLE[method];
  return (
    <span
      className={`inline-flex items-center justify-center rounded font-black tracking-wider border ${sm ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[11px]'}`}
      style={{ color: m.color, background: m.bg, borderColor: m.border }}
    >
      {method}
    </span>
  );
}

/* ── Copy field (Quick reference) ── */
function CopyField({ label, value, accent }: { label: string; value: string; accent: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">{label}</p>
      <div className="bg-slate-900 rounded-xl px-4 py-3 border border-slate-700 flex items-center justify-between gap-3">
        <code className="text-[12px] font-mono font-bold select-all truncate" style={{ color: accent }}>
          {value}
        </code>
        <button onClick={copy} className="text-slate-500 hover:text-white transition-colors shrink-0">
          <Icon name={copied ? 'check' : 'content_copy'} className="text-[16px]" />
        </button>
      </div>
    </div>
  );
}

/* ── Endpoint detail ── */
function EndpointDetail({ ep }: { ep: Endpoint }) {
  const [tab, setTab] = useState<'curl' | 'python' | 'js'>('curl');
  const code = endpointCode(ep, tab);
  const codeLang = tab === 'curl' ? 'bash' : tab;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 flex-wrap mb-2">
          <MethodTag method={ep.method} />
          <code className="text-[14px] font-mono font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">{ep.path}</code>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded uppercase tracking-wide flex items-center gap-1">
            <Icon name="lock" className="text-[12px]" />
            {ep.auth}
          </span>
        </div>
        <p className="text-sm text-slate-500">{ep.summary}</p>
      </div>

      {/* params */}
      <div>
        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Tham số ({ep.params.length})</h4>
        {ep.params.length === 0 ? (
          <p className="text-[12px] text-slate-400 italic">Không có tham số.</p>
        ) : (
          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-2.5">Tên</th>
                  <th className="px-4 py-2.5">In</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Bắt buộc</th>
                  <th className="px-4 py-2.5">Mô tả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ep.params.map((p) => (
                  <tr key={p.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <code className="text-[11px] font-mono font-bold text-dgblue">{p.name}</code>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-[10px] font-mono text-slate-400">{p.in}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-[10px] font-mono text-purple-500">{p.type}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      {p.req ? (
                        <span className="text-[9px] font-black text-dgfake bg-red-50 px-1.5 py-0.5 rounded">required</span>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400">optional</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-slate-500">{p.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* code + response */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Request</h4>
            <div className="flex gap-1">
              {(['curl', 'python', 'js'] as const).map((id) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-colors ${
                    tab === id ? 'bg-dgblue/10 text-dgblue' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {id === 'js' ? 'JS' : id}
                </button>
              ))}
            </div>
          </div>
          <CodeBlock code={code} language={codeLang} />
        </div>
        <div>
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            Response
            <span className="text-[9px] font-bold text-dgreal bg-emerald-50 px-1.5 py-0.5 rounded">
              {ep.method === 'POST' && ep.group === 'Management' ? '201 Created' : ep.method === 'DELETE' ? '204 No Content' : '200 OK'}
            </span>
          </h4>
          <CodeBlock code={JSON.stringify(ep.response, null, 2)} language="json" />
        </div>
      </div>
    </div>
  );
}

/* ── State block (empty search) ── */
function StateBlock({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="glass-panel rounded-2xl py-16 flex flex-col items-center justify-center text-center border border-white/60">
      <Icon name={icon} className="text-[40px] text-slate-300 mb-3" />
      <p className="text-sm font-bold text-slate-600">{title}</p>
      <p className="text-xs text-slate-400 mt-1">{desc}</p>
    </div>
  );
}

/* ── Small section heading ── */
function PanelHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
      <span className="w-1.5 h-1.5 bg-dgblue rounded-full" />
      {children}
    </h2>
  );
}

/* ──────────────────────────────────────────────
   SECTION 1 — Bắt đầu (Getting started)
   ────────────────────────────────────────────── */
function GettingStarted() {
  return (
    <div className="space-y-5 dg-fade">
      {/* intro */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
        <PanelHeading>Giới thiệu DeepGuard</PanelHeading>
        <p className="text-sm text-slate-600 leading-relaxed">
          DeepGuard là nền tảng <strong className="text-slate-800">phát hiện deepfake ảnh/video</strong> kết hợp{' '}
          <strong className="text-slate-800">kiểm tra liveness (eKYC)</strong> dành cho ngân hàng và fintech. Hệ thống
          vận hành <strong className="text-slate-800">đa tenant</strong>: mỗi tổ chức có không gian dữ liệu, hạn mức và
          thành viên riêng, được phân quyền theo vai trò.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          {(
            [
              ['photo_camera', DG.primary, 'Phát hiện ảnh', 'Phân tích spatial + frequency để bóc deepfake trên ảnh tĩnh.'],
              ['movie', DG.uncertain, 'Phát hiện video', 'Lấy mẫu per-frame, tổng hợp verdict cho cả video.'],
              ['face', DG.real, 'Liveness eKYC', 'Phân biệt người thật / giả mạo, hỗ trợ passive & active.'],
            ] as const
          ).map(([ic, col, title, desc]) => (
            <div key={title} className="rounded-xl bg-white/60 border border-slate-100 p-4">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${col}14`, color: col }}>
                <Icon name={ic} className="text-[20px]" fill />
              </span>
              <p className="text-[13px] font-bold text-slate-800 mt-3">{title}</p>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* auth model */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
        <PanelHeading>Mô hình xác thực — 2 loại</PanelHeading>
        <p className="text-sm text-slate-500 mb-4">
          DeepGuard tách bạch xác thực <strong className="text-slate-700">người dùng dashboard</strong> và{' '}
          <strong className="text-slate-700">hệ thống tích hợp</strong>. Hãy dùng đúng loại cho từng nhóm endpoint.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* JWT */}
          <div className="rounded-2xl border-2 p-5" style={{ borderColor: '#bfdbfe', background: '#eff6ff80' }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon name="badge" className="text-[20px] text-dgblue" fill />
              <h3 className="text-sm font-black text-slate-800">Dashboard — JWT</h3>
            </div>
            <p className="text-[12px] text-slate-600 leading-relaxed">
              Đăng nhập email/mật khẩu ở <code className="text-[11px] font-mono bg-white px-1.5 py-0.5 rounded border border-blue-100">/auth/login</code>{' '}
              → nhận <code className="text-[11px] font-mono bg-white px-1.5 py-0.5 rounded border border-blue-100">access_token</code>. Gửi kèm
              header cho các API dashboard:
            </p>
            <code className="block mt-2 text-[11px] font-mono bg-slate-900 text-blue-200 px-3 py-2 rounded-lg">
              Authorization: Bearer &lt;JWT&gt;
            </code>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Dùng cho: <span className="font-mono text-slate-500">/auth, /analytics, /detections, /api-keys, /audit-logs, /users, /tenant, /models, /notifications, /webhooks…</span>
            </p>
          </div>
          {/* API Key */}
          <div className="rounded-2xl border-2 p-5" style={{ borderColor: '#fed7aa', background: '#fff7ed80' }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon name="key" className="text-[20px] text-dguncertain" fill />
              <h3 className="text-sm font-black text-slate-800">API tích hợp — API Key</h3>
            </div>
            <p className="text-[12px] text-slate-600 leading-relaxed">
              Tạo key ở trang <strong className="text-slate-700">API Keys</strong> (chuỗi dạng{' '}
              <code className="text-[11px] font-mono bg-white px-1.5 py-0.5 rounded border border-orange-100">dg_…</code>). Gửi kèm header cho các
              endpoint nhận diện:
            </p>
            <code className="block mt-2 text-[11px] font-mono bg-slate-900 text-orange-200 px-3 py-2 rounded-lg">
              Authorization: Bearer &lt;API_KEY&gt;
            </code>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Dùng cho: <span className="font-mono text-slate-500">/v1/detect/*, /v1/liveness/*</span>.{' '}
              <strong className="text-dguncertain">Key chỉ hiện 1 lần khi tạo</strong> — hãy lưu lại ngay.
            </p>
          </div>
        </div>
      </div>

      {/* demo accounts */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
        <PanelHeading>5 tài khoản demo</PanelHeading>
        <p className="text-sm text-slate-500 mb-4">
          Tất cả dùng chung mật khẩu{' '}
          <code className="text-[12px] font-mono font-bold text-dgblue bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Password123!</code>.
          Đăng nhập để trải nghiệm dashboard theo từng vai trò.
        </p>
        <div className="rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                <th className="px-4 py-2.5">Email</th>
                <th className="px-4 py-2.5">Vai trò</th>
                <th className="px-4 py-2.5">Mô tả</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {DEMO_ACCOUNTS.map((a) => (
                <tr key={a.email} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-2.5">
                    <code className="text-[12px] font-mono font-bold text-slate-700">{a.email}</code>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className="text-[10px] font-black px-2 py-0.5 rounded-md border"
                      style={{ color: ROLE_GUIDES[a.role].color, background: `${ROLE_GUIDES[a.role].color}12`, borderColor: `${ROLE_GUIDES[a.role].color}30` }}
                    >
                      {ROLE_LABEL[a.role]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[12px] text-slate-500">{a.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* navigation */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
        <PanelHeading>Điều hướng theo vai trò</PanelHeading>
        <p className="text-sm text-slate-600 leading-relaxed">
          Thanh sidebar <strong className="text-slate-800">tự đổi theo vai trò</strong> của tài khoản đăng nhập: mỗi vai
          trò chỉ thấy các trang được phép truy cập và vào thẳng Dashboard phù hợp (platform / tenant / integration /
          compliance / chỉ-xem). Xem chi tiết từng vai trò ở tab{' '}
          <strong className="text-dgblue">“Theo vai trò”</strong>.
        </p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   SECTION 2 — Theo vai trò (Per-role guide)
   ────────────────────────────────────────────── */
function RoleGuideSection() {
  const [role, setRole] = useState<Role>('sysadmin');
  const guide = ROLE_GUIDES[role];

  // Pages this role can access — derived from PAGE_ACCESS via canAccess (source of truth).
  const accessPages = useMemo(
    () => GUIDE_PAGES.filter((p) => canAccess(role, p)),
    [role],
  );

  return (
    <div className="space-y-5 dg-fade">
      {/* role selector cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {ALL_ROLES.map((r) => {
          const g = ROLE_GUIDES[r];
          const active = role === r;
          return (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`glass-panel rounded-2xl p-4 border text-left transition-all ${
                active ? 'shadow-md -translate-y-0.5' : 'border-white/60 hover:-translate-y-0.5'
              }`}
              style={active ? { borderColor: g.color, boxShadow: `0 8px 24px ${g.color}22` } : undefined}
            >
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${g.color}14`, color: g.color }}
              >
                <Icon name={g.icon} className="text-[20px]" fill={active} />
              </span>
              <p className="text-[13px] font-black text-slate-800 mt-2.5">{ROLE_LABEL[r]}</p>
              <p className="text-[10px] font-mono text-slate-400">{r}</p>
            </button>
          );
        })}
      </div>

      {/* role detail */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
        <div className="flex items-start gap-4">
          <span
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: `${guide.color}14`, color: guide.color }}
          >
            <Icon name={guide.icon} className="text-[26px]" fill />
          </span>
          <div>
            <h2 className="text-lg font-black text-slate-900">{ROLE_LABEL[role]}</h2>
            <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: guide.color }}>
              {guide.tagline}
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mt-2">{guide.description}</p>
          </div>
        </div>
      </div>

      {/* accessible pages */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
        <PanelHeading>Trang truy cập được ({accessPages.length})</PanelHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {accessPages.map((p) => {
            const meta = PAGE_META[p];
            const kind = accessKind(role, p);
            const readOnly = kind === 'view';
            return (
              <div key={p} className="flex items-start gap-3 rounded-xl bg-white/60 border border-slate-100 p-3">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-100 text-slate-500">
                  <Icon name={meta.icon} className="text-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-bold text-slate-800">{meta.label}</p>
                    {readOnly && (
                      <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wide flex items-center gap-0.5">
                        <Icon name="visibility" className="text-[11px]" /> chỉ xem
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{meta.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* workflow */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
        <PanelHeading>Nhiệm vụ chính & quy trình</PanelHeading>
        <ol className="space-y-2.5">
          {guide.workflow.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-black tabular-nums"
                style={{ background: `${guide.color}14`, color: guide.color }}
              >
                {i + 1}
              </span>
              <p className="text-[13px] text-slate-600 leading-relaxed pt-0.5">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* permissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
          <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
            <Icon name="check_circle" className="text-[18px] text-dgreal" fill /> Làm được
          </h3>
          <ul className="space-y-2">
            {guide.can.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-slate-600 leading-relaxed">
                <Icon name="check" className="text-[16px] text-dgreal shrink-0 mt-0.5" />
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
          <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
            <Icon name="cancel" className="text-[18px] text-dgfake" fill /> KHÔNG làm được
          </h3>
          <ul className="space-y-2">
            {guide.cannot.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-slate-600 leading-relaxed">
                <Icon name="block" className="text-[16px] text-dgfake shrink-0 mt-0.5" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* permission matrix */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
        <PanelHeading>Ma trận phân quyền</PanelHeading>
        <p className="text-sm text-slate-500 mb-4 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1 text-[12px]">
            <Icon name="edit" className="text-[14px] text-dgreal" /> = chỉnh sửa
          </span>
          <span className="flex items-center gap-1 text-[12px]">
            <Icon name="visibility" className="text-[14px] text-dgblue" /> = chỉ xem
          </span>
          <span className="flex items-center gap-1 text-[12px]">
            <span className="text-slate-300 font-black">—</span> = không truy cập
          </span>
        </p>
        <div className="rounded-xl border border-slate-100 overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                <th className="px-4 py-2.5 sticky left-0 bg-slate-50">Trang</th>
                {ALL_ROLES.map((r) => (
                  <th key={r} className="px-3 py-2.5 text-center whitespace-nowrap">
                    {ROLE_LABEL[r]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {GUIDE_PAGES.map((p) => (
                <tr key={p} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-2.5 sticky left-0 bg-white">
                    <span className="flex items-center gap-2">
                      <Icon name={PAGE_META[p].icon} className="text-[15px] text-slate-400" />
                      <span className="text-[12px] font-bold text-slate-700">{PAGE_META[p].label}</span>
                    </span>
                  </td>
                  {ALL_ROLES.map((r) => {
                    const kind = accessKind(r, p);
                    return (
                      <td key={r} className="px-3 py-2.5 text-center">
                        {kind === 'edit' ? (
                          <Icon name="edit" className="text-[16px] text-dgreal" />
                        ) : kind === 'view' ? (
                          <Icon name="visibility" className="text-[16px] text-dgblue" />
                        ) : (
                          <span className="text-slate-300 font-black">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   SECTION 3 — API Reference (existing explorer)
   ────────────────────────────────────────────── */
function ApiReferenceSection() {
  const navigate = useNavigation((s) => s.navigate);
  const [layout, setLayout] = useState<'explorer' | 'list'>('explorer');
  const [selected, setSelected] = useState(ENDPOINTS[0].id);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      ENDPOINTS.filter(
        (e) =>
          query === '' ||
          e.path.toLowerCase().includes(query.toLowerCase()) ||
          e.summary.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  const groups = useMemo(() => {
    const g: Record<string, Endpoint[]> = {};
    filtered.forEach((e) => {
      (g[e.group] = g[e.group] || []).push(e);
    });
    return Object.entries(g);
  }, [filtered]);

  const current = ENDPOINTS.find((e) => e.id === selected) ?? ENDPOINTS[0];

  return (
    <div className="space-y-5 dg-fade">
      {/* layout toggle + playground */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Tài liệu tham khảo DeepGuard Detection API — endpoints khớp với client thật.</p>
        <div className="flex items-center gap-2">
          <RangeToggle
            value={layout}
            onChange={(id) => setLayout(id as 'explorer' | 'list')}
            options={[
              { id: 'explorer', label: 'Explorer' },
              { id: 'list', label: 'Danh sách' },
            ]}
          />
          <button
            onClick={() => navigate('playground')}
            className="px-4 h-9 bg-dgblue text-white rounded-xl font-bold text-xs tracking-wide shadow-lg shadow-dgblue/25 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-2"
          >
            <Icon name="terminal" className="text-[16px]" /> Mở Playground
          </button>
        </div>
      </div>

      {/* auth note: JWT vs API key */}
      <div className="glass-panel rounded-2xl p-5 shadow-sm border border-white/60">
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-dgblue">
            <Icon name="info" className="text-[20px]" fill />
          </span>
          <div className="text-[13px] text-slate-600 leading-relaxed">
            <strong className="text-slate-800">Phân biệt xác thực:</strong> các endpoint nhận diện{' '}
            <code className="text-[11px] font-mono text-dguncertain bg-orange-50 px-1.5 py-0.5 rounded">/v1/*</code> dùng{' '}
            <strong className="text-dguncertain">API Key</strong> (chuỗi <span className="font-mono">dg_…</span>); các endpoint dashboard
            (auth, detections, analytics, api-keys, audit-logs, webhooks…) dùng <strong className="text-dgblue">Bearer JWT</strong> lấy từ{' '}
            <code className="text-[11px] font-mono bg-slate-100 px-1.5 py-0.5 rounded">/auth/login</code>.
          </div>
        </div>
      </div>

      {/* quick reference */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
        <PanelHeading>Quick Reference</PanelHeading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CopyField label="Base URL" value={BASE_URL} accent="#34d399" />
          <CopyField label="API Key header" value={AUTH_HEADER['API Key']} accent="#fb923c" />
          <CopyField label="JWT header" value={AUTH_HEADER['Bearer JWT']} accent="#60a5fa" />
        </div>
      </div>

      {/* explorer / list */}
      {layout === 'explorer' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* nav */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-3">
            <div className="relative">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm endpoint…"
                className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all"
              />
            </div>
            <div className="glass-panel rounded-2xl p-3 shadow-sm border border-white/60 sticky top-20 custom-scrollbar max-h-[calc(100vh-8rem)] overflow-y-auto">
              {groups.length === 0 ? (
                <p className="text-[11px] text-slate-400 text-center py-6">Không tìm thấy endpoint</p>
              ) : (
                groups.map(([grp, eps]) => (
                  <div key={grp} className="mb-3 last:mb-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 py-1.5">{grp}</p>
                    <div className="space-y-0.5">
                      {eps.map((e) => (
                        <button
                          key={e.id}
                          onClick={() => setSelected(e.id)}
                          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all text-left ${
                            selected === e.id ? 'bg-dgblue/8' : 'hover:bg-slate-50'
                          }`}
                        >
                          <MethodTag method={e.method} sm />
                          <span
                            className={`text-[11px] font-mono font-semibold truncate ${
                              selected === e.id ? 'text-dgblue' : 'text-slate-600'
                            }`}
                          >
                            {e.path.replace('/v1', '')}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* content */}
          <div className="lg:col-span-8 xl:col-span-9 glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
            <EndpointDetail ep={current} />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative max-w-sm">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm endpoint…"
              className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all"
            />
          </div>
          {filtered.length === 0 ? (
            <StateBlock icon="search_off" title="Không tìm thấy endpoint" desc="Thử từ khoá khác." />
          ) : (
            filtered.map((ep) => (
              <div key={ep.id} className="glass-panel rounded-2xl shadow-sm border border-white/60 overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === ep.id ? null : ep.id)}
                  className="w-full flex items-center gap-4 p-5 hover:bg-slate-50/50 transition-colors text-left"
                >
                  <MethodTag method={ep.method} />
                  <code className="text-[13px] font-mono font-bold text-slate-800">{ep.path}</code>
                  <p className="text-[12px] text-slate-500 font-medium flex-1 min-w-0 truncate">{ep.summary}</p>
                  <Icon name={expanded === ep.id ? 'expand_less' : 'expand_more'} className="text-[20px] text-slate-300" />
                </button>
                {expanded === ep.id && (
                  <div className="px-5 pb-6 pt-1 border-t border-slate-100 dg-fade">
                    <EndpointDetail ep={ep} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* status codes + resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
          <PanelHeading>Status Codes</PanelHeading>
          <div className="space-y-1.5">
            {STATUS_CODES.map((sc) => (
              <div key={sc.code} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-[12px] font-black font-mono tabular-nums w-9" style={{ color: sc.color }}>
                  {sc.code}
                </span>
                <span className="text-[12px] font-bold text-slate-700 w-40">{sc.label}</span>
                <span className="text-[11px] text-slate-400 flex-1">{sc.desc}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
          <PanelHeading>Tài nguyên</PanelHeading>
          <div className="space-y-3">
            {(
              [
                ['terminal', DG.primary, 'Playground', 'Test API trực tiếp, xem kết quả real-time', () => navigate('playground')],
                ['menu_book', DG.real, 'Swagger UI', 'OpenAPI tương tác tại /docs', null],
                ['code', DG.uncertain, 'SDK', 'Python · Node · Go client libraries', null],
              ] as const
            ).map(([ic, col, title, desc, action]) => (
              <button
                key={title}
                onClick={action ?? (() => {})}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white/60 border border-slate-100 hover:border-slate-200 hover:-translate-y-0.5 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${col}10` }}>
                  <Icon name={ic} className="text-[20px]" style={{ color: col }} fill />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-800">{title}</p>
                  <p className="text-[11px] text-slate-400">{desc}</p>
                </div>
                <Icon name="arrow_forward" className="text-[16px] text-slate-300 group-hover:text-dgblue group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   DOCS PAGE — Documentation Hub
   ────────────────────────────────────────────── */
type DocsSection = 'start' | 'roles' | 'api';

export default function DocsPage() {
  const [section, setSection] = useState<DocsSection>('start');

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4 dg-fade">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            Tài liệu DeepGuard
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-blue-50 text-dgblue border border-blue-200">
              v2.1
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Hướng dẫn sử dụng theo vai trò + API reference đầy đủ</p>
        </div>
      </div>

      {/* section switcher */}
      <div className="dg-fade">
        <RangeToggle
          value={section}
          onChange={(id) => setSection(id as DocsSection)}
          options={[
            { id: 'start', label: 'Bắt đầu' },
            { id: 'roles', label: 'Theo vai trò' },
            { id: 'api', label: 'API Reference' },
          ]}
        />
      </div>

      {/* section content */}
      {section === 'start' && <GettingStarted />}
      {section === 'roles' && <RoleGuideSection />}
      {section === 'api' && <ApiReferenceSection />}
    </div>
  );
}
