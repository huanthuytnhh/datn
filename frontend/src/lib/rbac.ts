/**
 * RBAC — single source of truth for role → page access on the client.
 * Mirrors backend role guards (require_role). Keep the two in sync.
 *
 * Actors (deepguard_db UserRole):
 *  - sysadmin   : DeepGuard Ops, cross-tenant platform admin
 *  - admin      : Tenant admin (manages own org)
 *  - developer  : API integrator
 *  - compliance : auditor / compliance officer
 *  - viewer     : read-only stakeholder
 */
import type { Page } from '@/store/navigation';

export type Role = 'sysadmin' | 'admin' | 'developer' | 'compliance' | 'viewer';

export const ROLE_LABEL: Record<Role, string> = {
  sysadmin: 'System Admin',
  admin: 'Tenant Admin',
  developer: 'Developer',
  compliance: 'Compliance',
  viewer: 'Viewer',
};

/** Workspace pages each role may open (login/landing are public, handled separately). */
export const PAGE_ACCESS: Record<Page, Role[]> = {
  landing: ['sysadmin', 'admin', 'developer', 'compliance', 'viewer'],
  login: ['sysadmin', 'admin', 'developer', 'compliance', 'viewer'],

  dashboard: ['sysadmin', 'admin', 'developer', 'compliance', 'viewer'],
  account: ['sysadmin', 'admin', 'developer', 'compliance', 'viewer'],
  notifications: ['sysadmin', 'admin', 'developer', 'compliance', 'viewer'],
  docs: ['sysadmin', 'admin', 'developer', 'compliance', 'viewer'],

  history: ['sysadmin', 'admin', 'developer', 'compliance', 'viewer'],
  detail: ['sysadmin', 'admin', 'developer', 'compliance', 'viewer'],
  analytics: ['sysadmin', 'admin', 'developer', 'compliance', 'viewer'],
  status: ['sysadmin', 'admin', 'developer', 'compliance', 'viewer'],

  playground: ['admin', 'developer'], // cần API key để chạy detect → chỉ vai trò tích hợp
  liveness: ['admin', 'developer'],
  apikeys: ['admin', 'developer'],
  webhooks: ['admin', 'developer'],
  models: ['sysadmin', 'admin', 'developer', 'compliance'], // edit gated separately by canEdit

  audit: ['sysadmin', 'admin', 'compliance'],

  team: ['admin', 'sysadmin'],
  billing: ['admin'],
  settings: ['admin', 'sysadmin'],

  tenants: ['sysadmin'], // cross-tenant platform admin only
};

export function canAccess(role: Role | undefined | null, page: Page): boolean {
  if (!role) return false;
  return PAGE_ACCESS[page]?.includes(role) ?? false;
}

/**
 * Write/edit capability gate (read access already implied by canAccess).
 * Used to hide create/edit/delete actions for read-mostly roles.
 */
export function canEdit(role: Role | undefined | null, page: Page): boolean {
  if (!role) return false;
  if (role === 'viewer') return false; // viewer never edits
  // Models & thresholds are PLATFORM-GLOBAL config → only sysadmin may mutate.
  if (page === 'models') return role === 'sysadmin';
  // Audit/review notes on a detection → admin + compliance only (SoD: not developer).
  if (page === 'detail') return role === 'admin' || role === 'compliance';
  // compliance is read-only everywhere else.
  if (role === 'compliance') return false;
  return canAccess(role, page);
}

/** Where each role lands right after login. */
export function defaultPageFor(role: Role | undefined | null): Page {
  switch (role) {
    case 'sysadmin':
      return 'dashboard'; // platform-ops variant
    case 'compliance':
      return 'dashboard'; // compliance variant
    default:
      return 'dashboard';
  }
}

export const ALL_ROLES: Role[] = ['sysadmin', 'admin', 'developer', 'compliance', 'viewer'];

// ── Role hierarchy (must mirror backend users.py ROLE_LEVEL) ──────────────────
export const ROLE_LEVEL: Record<Role, number> = {
  viewer: 0, developer: 1, compliance: 2, admin: 3, sysadmin: 4,
};
const lvl = (r: string | undefined | null): number =>
  (r && r in ROLE_LEVEL ? ROLE_LEVEL[r as Role] : 0);

/** Can `actor` edit/delete a user whose role is `targetRole`?
 *  Only admin/sysadmin manage users, and never someone ranked higher than them. */
export function canManageUser(actor: Role | undefined | null, targetRole: string): boolean {
  if (actor !== 'admin' && actor !== 'sysadmin') return false;
  return lvl(targetRole) <= lvl(actor);
}

/** Roles `actor` may assign/invite — never above their own level. */
export function assignableRoles(actor: Role | undefined | null): Role[] {
  return ALL_ROLES.filter((r) => lvl(r) <= lvl(actor)).sort((a, b) => lvl(a) - lvl(b));
}
