/**
 * UDYORA Admin Authentication & Session Service
 * Provides centralized session management, role validation, and route guards.
 *
 * AUTHENTICATION CONFIGURATION:
 * - Admin Role: Full platform administration
 * - Editorial Role: Content, location, scheme & translation management
 * Default Email: admin@udyora.gov.in
 * Default Password: 123456
 */

export type AdminRole = 'ADMIN' | 'EDITORIAL';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  lastLogin: string;
}

const ADMIN_SESSION_KEY = 'udyora_admin_session';

export const ADMIN_AUTH_CONFIG = {
  defaultEmail: 'admin@udyora.gov.in',
  defaultPassword: '123456',
  portalName: 'UDYORA Administration Center'
};

// Backward-compatible alias
export const PROTOTYPE_AUTH_CONFIG = ADMIN_AUTH_CONFIG;

// Restricted subroutes for EDITORIAL role
export const EDITORIAL_RESTRICTED_ROUTES = [
  'financial-rules',
  'users',
  'audit-logs',
  'settings'
];

export function getAdminSession(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY) || localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function isAuthenticatedAdmin(): boolean {
  return getAdminSession() !== null;
}

export function isRouteAllowedForRole(role: AdminRole, route: string): boolean {
  if (role === 'ADMIN') return true;
  return !EDITORIAL_RESTRICTED_ROUTES.includes(route);
}

export function loginAdmin(
  email: string,
  pass: string,
  selectedRole: AdminRole = 'ADMIN',
  remember: boolean = false
): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = pass.trim();

      const isEmailValid = cleanEmail === ADMIN_AUTH_CONFIG.defaultEmail || cleanEmail === 'admin';
      const isPassValid = cleanPass === ADMIN_AUTH_CONFIG.defaultPassword;

      if (isEmailValid && isPassValid) {
        const user: AdminUser = {
          id: selectedRole === 'ADMIN' ? 'adm_super_01' : 'adm_edit_02',
          email: ADMIN_AUTH_CONFIG.defaultEmail,
          name: selectedRole === 'ADMIN' ? 'Chief Policy Administrator' : 'Editorial Content Officer',
          role: selectedRole,
          lastLogin: new Date().toISOString()
        };

        const serialized = JSON.stringify(user);
        if (remember) {
          localStorage.setItem(ADMIN_SESSION_KEY, serialized);
        } else {
          sessionStorage.setItem(ADMIN_SESSION_KEY, serialized);
        }

        resolve({ success: true, user });
      } else {
        resolve({
          success: false,
          error: 'Invalid administrator credentials. Please verify your email and password.'
        });
      }
    }, 400);
  });
}

export function logoutAdmin(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
}
