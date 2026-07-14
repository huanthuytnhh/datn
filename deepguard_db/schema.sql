-- ════════════════════════════════════════════════════════════════════════
-- DeepGuard Database DDL — PostgreSQL 15+
-- Generate từ SQLAlchemy models. Có thể chạy thẳng để init database.
-- ════════════════════════════════════════════════════════════════════════

-- Tạo database (nếu chưa có)
-- CREATE DATABASE deepguard;
-- \c deepguard;

-- Extensions cần thiết
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ════════════════════════════════════════════════════════════════════════
-- ENUM TYPES
-- ════════════════════════════════════════════════════════════════════════
CREATE TYPE tenant_plan       AS ENUM ('starter', 'pro', 'enterprise');
CREATE TYPE tenant_status     AS ENUM ('active', 'suspended', 'deleted');
CREATE TYPE user_role         AS ENUM ('developer', 'compliance', 'admin', 'sysadmin');
CREATE TYPE api_key_status    AS ENUM ('active', 'suspended', 'revoked');
CREATE TYPE webhook_status    AS ENUM ('active', 'paused');
CREATE TYPE detection_verdict AS ENUM ('REAL', 'FAKE', 'UNCERTAIN');
CREATE TYPE job_type          AS ENUM ('video_detection', 'batch_detection');
CREATE TYPE job_status        AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');


-- ════════════════════════════════════════════════════════════════════════
-- 1. TENANTS
-- ════════════════════════════════════════════════════════════════════════
CREATE TABLE tenants (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(200) NOT NULL,
    plan            tenant_plan NOT NULL DEFAULT 'starter',
    status          tenant_status NOT NULL DEFAULT 'active',
    monthly_quota   INT NOT NULL DEFAULT 100,
    current_usage   INT NOT NULL DEFAULT 0,
    admin_email     VARCHAR(255) NOT NULL,
    billing_email   VARCHAR(255),
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_quota_positive CHECK (monthly_quota >= 0),
    CONSTRAINT ck_usage_positive CHECK (current_usage >= 0)
);
CREATE INDEX idx_tenant_status_plan ON tenants (status, plan);
CREATE INDEX idx_tenant_created     ON tenants (created_at);


-- ════════════════════════════════════════════════════════════════════════
-- 2. USERS
-- ════════════════════════════════════════════════════════════════════════
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(200) NOT NULL,
    role            user_role NOT NULL DEFAULT 'developer',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_user_email_tenant UNIQUE (email, tenant_id)
);
CREATE INDEX idx_user_tenant_role ON users (tenant_id, role);
CREATE INDEX idx_user_email       ON users (email);


-- ════════════════════════════════════════════════════════════════════════
-- 3. API_KEYS
-- ════════════════════════════════════════════════════════════════════════
CREATE TABLE api_keys (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    key_hash        VARCHAR(64) NOT NULL,    -- SHA-256
    prefix          VARCHAR(16) NOT NULL,
    name            VARCHAR(200) NOT NULL,
    status          api_key_status NOT NULL DEFAULT 'active',
    quota_limit     INT NOT NULL DEFAULT 1000,
    quota_used      INT NOT NULL DEFAULT 0,
    rate_limit_rpm  INT NOT NULL DEFAULT 60,
    last_used_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_api_key_hash UNIQUE (key_hash)
);
CREATE INDEX idx_apikey_tenant_status ON api_keys (tenant_id, status);
CREATE INDEX idx_apikey_prefix        ON api_keys (prefix);


-- ════════════════════════════════════════════════════════════════════════
-- 4. INVITATIONS
-- ════════════════════════════════════════════════════════════════════════
CREATE TABLE invitations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email           VARCHAR(255) NOT NULL,
    role            user_role NOT NULL,
    token           VARCHAR(128) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    accepted_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_invitation_token UNIQUE (token)
);
CREATE INDEX idx_invitation_email ON invitations (email);


-- ════════════════════════════════════════════════════════════════════════
-- 5. WEBHOOKS
-- ════════════════════════════════════════════════════════════════════════
CREATE TABLE webhooks (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    url                     VARCHAR(500) NOT NULL,
    events                  JSONB NOT NULL DEFAULT '[]',
    secret                  VARCHAR(255),
    status                  webhook_status NOT NULL DEFAULT 'active',
    last_delivery_at        TIMESTAMPTZ,
    last_delivery_status    INT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_webhook_tenant_status ON webhooks (tenant_id, status);


-- ════════════════════════════════════════════════════════════════════════
-- 6. DETECTIONS — Audit log mỗi /v1/detect/image call
-- ════════════════════════════════════════════════════════════════════════
CREATE TABLE detections (
    request_id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    api_key_id          UUID REFERENCES api_keys(id),   -- NULL = playground detection
    source              VARCHAR(20) NOT NULL DEFAULT 'api', -- 'api' | 'playground'

    verdict             detection_verdict NOT NULL,
    confidence          FLOAT NOT NULL,
    prob_fake           FLOAT NOT NULL,
    prob_cnn            FLOAT NOT NULL,
    spatial_score       FLOAT,
    frequency_score     FLOAT,
    threshold_used      FLOAT NOT NULL,

    image_hash          VARCHAR(64) NOT NULL,
    image_width         INT,
    image_height        INT,
    heatmap_url         VARCHAR(500),

    processing_time_ms  INT NOT NULL,
    model_version       VARCHAR(50) NOT NULL,

    user_agent          VARCHAR(500),
    ip_address          VARCHAR(45),
    audit_notes         JSONB NOT NULL DEFAULT '[]',

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_confidence_range CHECK (confidence >= 0 AND confidence <= 100),
    CONSTRAINT ck_prob_range       CHECK (prob_fake >= 0 AND prob_fake <= 1)
);
CREATE INDEX idx_detection_tenant_created  ON detections (tenant_id, created_at DESC);
CREATE INDEX idx_detection_verdict_created ON detections (verdict, created_at DESC);
CREATE INDEX idx_detection_apikey_created  ON detections (api_key_id, created_at DESC) WHERE api_key_id IS NOT NULL;
CREATE INDEX idx_detection_source         ON detections (source, created_at DESC);


-- ════════════════════════════════════════════════════════════════════════
-- 7. JOBS — Async video detection
-- ════════════════════════════════════════════════════════════════════════
CREATE TABLE jobs (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    api_key_id          UUID NOT NULL REFERENCES api_keys(id),
    type                job_type NOT NULL,
    status              job_status NOT NULL DEFAULT 'PENDING',
    progress_percent    INT NOT NULL DEFAULT 0,
    input_url           VARCHAR(500),
    result              JSONB NOT NULL DEFAULT '{}',
    error_message       VARCHAR(1000),
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    webhook_url         VARCHAR(500),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_progress_range CHECK (progress_percent >= 0 AND progress_percent <= 100)
);
CREATE INDEX idx_job_status_created  ON jobs (status, created_at DESC);
CREATE INDEX idx_job_tenant_created  ON jobs (tenant_id, created_at DESC);


-- ════════════════════════════════════════════════════════════════════════
-- 8. WEBHOOK_DELIVERIES — Delivery log
-- ════════════════════════════════════════════════════════════════════════
CREATE TABLE webhook_deliveries (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id      UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    event_type      VARCHAR(100) NOT NULL,
    payload         JSONB NOT NULL,
    status_code     INT,
    response_body   VARCHAR(2000),
    latency_ms      INT,
    delivered       BOOLEAN NOT NULL DEFAULT FALSE,
    attempt_count   INT NOT NULL DEFAULT 1,
    next_retry_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_delivery_webhook_created ON webhook_deliveries (webhook_id, created_at DESC);
CREATE INDEX idx_delivery_retry           ON webhook_deliveries (next_retry_at) WHERE next_retry_at IS NOT NULL;


-- ════════════════════════════════════════════════════════════════════════
-- 9. AUDIT_LOGS (BIGSERIAL vì high-write)
-- ════════════════════════════════════════════════════════════════════════
CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       UUID REFERENCES tenants(id) ON DELETE SET NULL,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    action          VARCHAR(100) NOT NULL,
    resource_type   VARCHAR(50) NOT NULL,
    resource_id     UUID,
    metadata        JSONB NOT NULL DEFAULT '{}',
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_created          ON audit_logs (created_at DESC);
CREATE INDEX idx_audit_tenant_created   ON audit_logs (tenant_id, created_at DESC);
CREATE INDEX idx_audit_action_created   ON audit_logs (action, created_at DESC);
CREATE INDEX idx_audit_resource         ON audit_logs (resource_type, resource_id);

-- Production: partition by month
-- CREATE TABLE audit_logs_2025_05 PARTITION OF audit_logs FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');


-- ════════════════════════════════════════════════════════════════════════
-- 10. MODEL_VERSIONS
-- ════════════════════════════════════════════════════════════════════════
CREATE TABLE model_versions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version             VARCHAR(50) NOT NULL,
    architecture        VARCHAR(200) NOT NULL,
    auc_celeb           FLOAT,
    auc_ffpp            FLOAT,
    threshold           FLOAT NOT NULL DEFAULT 0.5,
    training_dataset    VARCHAR(200),
    checkpoint_path     VARCHAR(500) NOT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT FALSE,
    traffic_percent     INT NOT NULL DEFAULT 0,
    deployed_at         TIMESTAMPTZ,
    metadata            JSONB NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_model_version    UNIQUE (version),
    CONSTRAINT ck_traffic_range    CHECK (traffic_percent >= 0 AND traffic_percent <= 100)
);


-- ════════════════════════════════════════════════════════════════════════
-- TRIGGER tự động update updated_at
-- ════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN
        SELECT table_name FROM information_schema.columns
        WHERE column_name = 'updated_at' AND table_schema = 'public'
    LOOP
        EXECUTE format('
            CREATE TRIGGER trg_%I_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
        ', t, t);
    END LOOP;
END $$;


-- ════════════════════════════════════════════════════════════════════════
-- SEED DATA (cho dev/demo)
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO tenants (id, name, plan, monthly_quota, admin_email) VALUES
    ('00000000-0000-0000-0000-000000000001', 'VietBank Demo',  'pro',        10000, 'admin@vietbank.vn'),
    ('00000000-0000-0000-0000-000000000002', 'Techcombank',    'enterprise', 100000,'tech@techcombank.com.vn'),
    ('00000000-0000-0000-0000-000000000003', 'MoMo Wallet',    'starter',    100,   'admin@momo.vn');

INSERT INTO model_versions (version, architecture, auc_celeb, auc_ffpp, threshold, checkpoint_path, is_active, traffic_percent, deployed_at)
VALUES
    ('b4-baseline-v1',     'EfficientNet-B4',                        0.9056, 0.9553, 0.6197, '/models/b4_baseline_v1.pth', TRUE, 100, NOW()),
    ('hybrid-b4-dct-v3',   'EfficientNet-B4 + DCT + SBI + MS-Gate',  0.9234, 0.9612, 0.6451, '/models/hybrid_v3.pth',      FALSE, 0, NULL);
