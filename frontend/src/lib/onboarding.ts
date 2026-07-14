import type { Role } from '@/lib/rbac';
import type { Page } from '@/store/navigation';

/* onboarding.ts — mô hình "Teaching Tips & Tours" kiểu Business Central:
   • PAGE_TIPS  = page teaching tip cho mỗi trang ("trang này là gì / làm được gì") — hiện góc dưới-trái,
                  mời người dùng "Xem hướng dẫn"; mở lại bằng cách bấm tiêu đề trang.
   • ROLE_TOURS = chuỗi control teaching tips (1–4 bước) trỏ vào phần tử sidebar ([data-tour="nav-<page>"])
                  bằng callout có mũi tên (beak). Nội dung ngắn: nêu OUTCOME, không phải các bước thao tác. */

export interface PageTip {
  title: string;   // AboutTitle — "Trang này là gì?"
  body: string;    // AboutText  — "Làm được gì ở đây?"
  icon: string;
}

export interface TourStep {
  title: string;
  body: string;
  icon: string;
  target: string;  // CSS selector của phần tử được trỏ
}

/** Page teaching tip theo từng trang (góc dưới-trái). Ngắn gọn, nêu outcome. */
export const PAGE_TIPS: Partial<Record<Page, PageTip>> = {
  dashboard: { title: 'Về trang Dashboard', body: 'Tổng quan hoạt động phát hiện deepfake theo vai trò của bạn: lưu lượng, tỉ lệ nghi giả, độ trễ và hạn mức.', icon: 'dashboard' },
  playground: { title: 'Về API Playground', body: 'Thử nhanh ngay trong dashboard — không cần API key. Tải ảnh/video để xem **risk-score**, **Grad-CAM** và **phổ tần số**.', icon: 'terminal' },
  liveness: { title: 'Về Liveness Check', body: 'Kiểm tra người thật / giả mạo trình diễn (ảnh in, màn hình) phục vụ định danh eKYC.', icon: 'face_6' },
  apikeys: { title: 'Về API Keys', body: 'Khoá *sk-dg-…* để hệ thống của bạn gọi `/v1/detect`. Khoá đầy đủ chỉ hiện **một lần** khi tạo.', icon: 'key' },
  webhooks: { title: 'Về Webhooks', body: 'Đăng ký URL callback để nhận kết quả phát hiện tự động thay vì hỏi (poll).', icon: 'webhook' },
  history: { title: 'Về Lịch sử phát hiện', body: 'Mọi lần phát hiện được lưu tại đây để tra cứu. Mở một mục để xem chi tiết và bằng chứng.', icon: 'history' },
  detail: { title: 'Về Chi tiết phát hiện', body: 'Risk-score, Grad-CAM, phổ tần số và ghi chú điều tra của một lần phát hiện.', icon: 'frame_inspect' },
  analytics: { title: 'Về Phân tích', body: 'Xu hướng lưu lượng, tỉ lệ nghi giả và độ trễ theo thời gian.', icon: 'analytics' },
  audit: { title: 'Về Audit Logs', body: 'Nhật ký mọi hành vi để phục vụ kiểm toán và tuân thủ; có thể xuất.', icon: 'gavel' },
  status: { title: 'Về Status & Compliance', body: 'Sức khoẻ hệ thống, chính sách lưu trữ và các mốc tuân thủ.', icon: 'monitor_heart' },
  models: { title: 'Về Models & Thresholds', body: 'Phiên bản model phục vụ và ngưỡng phán đoán. Việc chỉnh ngưỡng do quản trị nền tảng thực hiện.', icon: 'model_training' },
  team: { title: 'Về Team & Roles', body: 'Mời thành viên và gán vai trò trong tổ chức. Vai trò *compliance* / *sysadmin* do nền tảng cấp.', icon: 'group' },
  tenants: { title: 'Về Quản lý Tenants', body: 'Quản trị xuyên tổ chức: tạo tenant, đổi gói & hạn mức, kích hoạt/tạm ngưng, xem người dùng & khoá.', icon: 'domain' },
  billing: { title: 'Về Billing & Usage', body: 'Gói cước và mức tiêu thụ hạn mức theo tháng của tổ chức.', icon: 'credit_card' },
  settings: { title: 'Về Cài đặt', body: 'Cấu hình tổ chức và tuỳ chọn hệ thống.', icon: 'settings' },
  account: { title: 'Về Tài khoản', body: 'Hồ sơ cá nhân, đổi mật khẩu và tuỳ chọn bảo mật.', icon: 'person' },
  docs: { title: 'Về Tài liệu', body: 'Tham chiếu API, ví dụ Python/cURL/JS và định dạng response.', icon: 'menu_book' },
  notifications: { title: 'Về Thông báo', body: 'Cảnh báo hệ thống, ngưỡng hạn mức và sự kiện liên quan tới tổ chức.', icon: 'notifications' },
};

/** Control tour TRONG TỪNG TRANG — trỏ vào button/section của chính trang đó (data-tour="<page>-…").
   Dùng khi bấm "Xem hướng dẫn" trên page teaching tip của trang tương ứng. Giữ 1–4 bước. */
export const PAGE_TOURS: Partial<Record<Page, TourStep[]>> = {
  playground: [
    { title: 'Tải media', body: 'Kéo-thả hoặc bấm để chọn **ảnh/video** cần kiểm tra. Hỗ trợ JPG/PNG/WEBP và MP4.', icon: 'upload_file', target: '[data-tour="pg-upload"]' },
    { title: 'Mẫu có sẵn', body: 'Chưa có file? Dùng các **ảnh mẫu** (thật / GAN / swap) để thử nhanh.', icon: 'image', target: '[data-tour="pg-samples"]' },
    { title: 'Phân tích', body: 'Bấm để chạy. Kết quả **risk-score + band**, **Grad-CAM** và **phổ tần số** hiện bên phải — không cần API key.', icon: 'rocket_launch', target: '[data-tour="pg-analyze"]' },
    { title: 'Tích hợp', body: 'Khi tích hợp thật, sao chép mã mẫu **Python / cURL / JS** ở đây.', icon: 'code', target: '[data-tour="pg-code"]' },
  ],
  tenants: [
    { title: 'Tạo tenant', body: 'Mở wizard tạo **tổ chức mới** + tài khoản admin (kích hoạt ngay, có mật khẩu tạm).', icon: 'add_business', target: '[data-tour="tn-create"]' },
    { title: 'Chỉ số nền tảng', body: 'Tổng quan: số tổ chức, đang hoạt động, mức tiêu thụ và người dùng.', icon: 'leaderboard', target: '[data-tour="tn-kpis"]' },
    { title: 'Lọc & tìm', body: 'Lọc theo **gói cước** hoặc tìm theo tên để khoanh vùng tổ chức cần quản lý.', icon: 'filter_list', target: '[data-tour="tn-filter"]' },
  ],
  team: [
    { title: 'Thêm/mời thành viên', body: 'Tạo tài khoản trực tiếp hoặc **mời qua email**; gán vai trò khi tạo.', icon: 'person_add', target: '[data-tour="tm-add"]' },
    { title: 'Vai trò & quyền', body: 'Tab *Vai trò & quyền* mô tả ai làm được gì — tham chiếu nhanh khi phân quyền.', icon: 'admin_panel_settings', target: '[data-tour="tm-tabs"]' },
  ],
  apikeys: [
    { title: 'Tạo khoá', body: 'Sinh khoá *sk-dg-…* cho tích hợp. **Khoá đầy đủ chỉ hiện một lần** — lưu lại ngay.', icon: 'key', target: '[data-tour="ak-create"]' },
    { title: 'Theo dõi sử dụng', body: 'Tổng số khoá, đang hoạt động, request đã dùng và % hạn mức.', icon: 'speed', target: '[data-tour="ak-kpis"]' },
  ],
  history: [
    { title: 'Lọc & tìm', body: 'Lọc theo **kết luận** (thật/giả), độ tin cậy, khoảng ngày hoặc tìm theo request.', icon: 'filter_list', target: '[data-tour="hs-filter"]' },
    { title: 'Xuất CSV', body: 'Tải danh sách đã lọc ra **CSV** để báo cáo hoặc đối soát.', icon: 'download', target: '[data-tour="hs-export"]' },
  ],
  audit: [
    { title: 'Lọc nhật ký', body: 'Tìm theo **hành vi**, người dùng hoặc IP để truy vết nhanh.', icon: 'filter_list', target: '[data-tour="au-filter"]' },
    { title: 'Xuất phục vụ kiểm toán', body: 'Xuất **CSV** toàn bộ nhật ký đã lọc cho hồ sơ tuân thủ.', icon: 'download', target: '[data-tour="au-export"]' },
  ],
};

/** Tour ĐỊNH HƯỚNG cho Dashboard (theo vai trò) — trỏ vào mục sidebar mà vai trò đó được dùng. */
export const ROLE_TOURS: Record<Role, TourStep[]> = {
  sysadmin: [
    { title: 'Dashboard nền tảng', body: 'Số liệu gộp toàn hệ thống: tổng tenant, người dùng, lưu lượng và tỉ lệ nghi giả.', icon: 'dashboard', target: '[data-tour="nav-dashboard"]' },
    { title: 'Quản lý Tenants', body: 'Tạo tổ chức, kích hoạt/tạm ngưng, đổi gói & hạn mức, xem người dùng và khoá của mọi tenant.', icon: 'domain', target: '[data-tour="nav-tenants"]' },
    { title: 'Models & Thresholds', body: 'Nơi duy nhất chỉnh ngưỡng và phiên bản model phục vụ — ảnh hưởng mọi tenant.', icon: 'model_training', target: '[data-tour="nav-models"]' },
  ],
  admin: [
    { title: 'Dashboard tổ chức', body: 'Hạn mức, lưu lượng, tỉ lệ nghi giả và độ trễ của riêng tổ chức bạn.', icon: 'dashboard', target: '[data-tour="nav-dashboard"]' },
    { title: 'Team & Roles', body: 'Mời thành viên và gán vai trò. Tài khoản *compliance* do nền tảng cấp.', icon: 'group', target: '[data-tour="nav-team"]' },
    { title: 'API Keys', body: 'Khoá tích hợp để hệ thống của bạn gọi dịch vụ phát hiện.', icon: 'key', target: '[data-tour="nav-apikeys"]' },
    { title: 'Playground', body: 'Thử nhanh ngay trong dashboard, không cần khoá.', icon: 'terminal', target: '[data-tour="nav-playground"]' },
  ],
  developer: [
    { title: 'Dashboard tích hợp', body: 'Theo dõi số request, deepfake bắt được, độ trễ và hạn mức khoá của bạn.', icon: 'dashboard', target: '[data-tour="nav-dashboard"]' },
    { title: 'API Playground', body: 'Tải ảnh/video, xem ngay risk-score, Grad-CAM và phổ tần số — dùng phiên đăng nhập, không cần khoá.', icon: 'terminal', target: '[data-tour="nav-playground"]' },
    { title: 'API Keys', body: 'Khi tích hợp thật từ backend: tạo khoá ở đây rồi gọi `/v1/detect`.', icon: 'key', target: '[data-tour="nav-apikeys"]' },
    { title: 'API Docs', body: 'Tham chiếu endpoint và mã ví dụ.', icon: 'menu_book', target: '[data-tour="nav-docs"]' },
  ],
  compliance: [
    { title: 'Dashboard rà soát', body: 'Hàng đợi các trường hợp nghi deepfake cần xem xét nằm tại đây.', icon: 'dashboard', target: '[data-tour="nav-dashboard"]' },
    { title: 'Lịch sử phát hiện', body: 'Xem chi tiết kèm PII và thêm ghi chú điều tra.', icon: 'history', target: '[data-tour="nav-history"]' },
    { title: 'Audit Logs', body: 'Nhật ký hành vi để tra cứu và xuất phục vụ kiểm toán.', icon: 'gavel', target: '[data-tour="nav-audit"]' },
  ],
  viewer: [
    { title: 'Dashboard', body: 'Các chỉ số tổng quan của tổ chức ở chế độ chỉ-đọc.', icon: 'dashboard', target: '[data-tour="nav-dashboard"]' },
    { title: 'Lịch sử phát hiện', body: 'Duyệt danh sách; mở chi tiết (PII được che với vai trò viewer).', icon: 'history', target: '[data-tour="nav-history"]' },
    { title: 'Phân tích', body: 'Biểu đồ lưu lượng, tỉ lệ nghi giả và độ trễ.', icon: 'analytics', target: '[data-tour="nav-analytics"]' },
  ],
};
