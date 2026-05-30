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

  playground: ['admin', 'developer', 'compliance'], // compliance = read/replay
  liveness: ['admin', 'developer', 'compliance'],
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
  if (role === 'compliance') {
    // compliance may add review notes but not mutate config/data
    return page === 'detail';
  }
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
