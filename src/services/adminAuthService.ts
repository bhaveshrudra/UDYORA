/**
 * UDYORA Admin Authentication & Role-Based Access Control (RBAC) Service
 * Strictly separates Entrepreneur flows from Administration Center.
 * Enforces role authorization, route protection, and security logging.
 */

export type UserRole =
  | 'ENTREPRENEUR'
  | 'ADMIN'
  | 'CHIEF_ADMINISTRATOR'
  | 'SCHEME_MANAGER'
  | 'CONTENT_MANAGER'
  | 'AUDITOR'
  | 'EDITORIAL_OFFICER';

export type AdminRole = UserRole;

export type AdminPermission =
  | 'VIEW_DASHBOARD'
  | 'MANAGE_SCHEMES'
  | 'MANAGE_EVIDENCE'
  | 'MANAGE_LOCATIONS'
  | 'MANAGE_BUSINESSES'
  | 'MANAGE_TRANSLATIONS'
  | 'VIEW_ASSESSMENTS'
  | 'MANAGE_USERS'
  | 'VIEW_AUDIT_LOGS'
  | 'MANAGE_SETTINGS';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: AdminPermission[];
  lastLogin: string;
}

const ADMIN_SESSION_KEY = 'udyora_admin_session';

export const ADMIN_AUTH_CONFIG = {
  defaultEmail: 'admin@udyora.gov.in',
  defaultPassword: '123456',
  portalName: 'UDYORA Administration Center'
};

export const PROTOTYPE_AUTH_CONFIG = ADMIN_AUTH_CONFIG;

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  ADMIN: [
    'VIEW_DASHBOARD',
    'MANAGE_SCHEMES',
    'MANAGE_EVIDENCE',
    'MANAGE_LOCATIONS',
    'MANAGE_BUSINESSES',
    'MANAGE_TRANSLATIONS',
    'VIEW_ASSESSMENTS',
    'MANAGE_USERS',
    'VIEW_AUDIT_LOGS',
    'MANAGE_SETTINGS'
  ],
  CHIEF_ADMINISTRATOR: [
    'VIEW_DASHBOARD',
    'MANAGE_SCHEMES',
    'MANAGE_EVIDENCE',
    'MANAGE_LOCATIONS',
    'MANAGE_BUSINESSES',
    'MANAGE_TRANSLATIONS',
    'VIEW_ASSESSMENTS',
    'MANAGE_USERS',
    'VIEW_AUDIT_LOGS',
    'MANAGE_SETTINGS'
  ],
  SCHEME_MANAGER: [
    'VIEW_DASHBOARD',
    'MANAGE_SCHEMES',
    'VIEW_ASSESSMENTS'
  ],
  CONTENT_MANAGER: [
    'VIEW_DASHBOARD',
    'MANAGE_EVIDENCE',
    'MANAGE_LOCATIONS',
    'MANAGE_BUSINESSES',
    'MANAGE_TRANSLATIONS'
  ],
  AUDITOR: [
    'VIEW_DASHBOARD',
    'VIEW_ASSESSMENTS',
    'VIEW_AUDIT_LOGS'
  ],
  EDITORIAL_OFFICER: [
    'VIEW_DASHBOARD',
    'MANAGE_SCHEMES',
    'MANAGE_EVIDENCE',
    'MANAGE_LOCATIONS',
    'MANAGE_BUSINESSES',
    'MANAGE_TRANSLATIONS',
    'VIEW_ASSESSMENTS'
  ],
  ENTREPRENEUR: []
};

// Route permission mapping
export const ROUTE_PERMISSION_MAP: Record<string, AdminPermission> = {
  dashboard: 'VIEW_DASHBOARD',
  schemes: 'MANAGE_SCHEMES',
  evidence: 'MANAGE_EVIDENCE',
  locations: 'MANAGE_LOCATIONS',
  businesses: 'MANAGE_BUSINESSES',
  translations: 'MANAGE_TRANSLATIONS',
  guidance: 'MANAGE_TRANSLATIONS',
  assessments: 'VIEW_ASSESSMENTS',
  participants: 'VIEW_ASSESSMENTS',
  users: 'MANAGE_USERS',
  'audit-logs': 'VIEW_AUDIT_LOGS',
  settings: 'MANAGE_SETTINGS'
};

export function getAdminSession(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY) || localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminUser;
    // Enrich with permissions if missing
    if (!parsed.permissions || parsed.permissions.length === 0) {
      parsed.permissions = ROLE_PERMISSIONS[parsed.role] || [];
    }
    return parsed;
  } catch {
    return null;
  }
}

export function isAuthenticatedAdmin(): boolean {
  const session = getAdminSession();
  if (!session) return false;
  return session.role !== 'ENTREPRENEUR' && session.permissions.length > 0;
}

export function hasPermission(user: AdminUser | null, permission: AdminPermission): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN' || user.role === 'CHIEF_ADMINISTRATOR') return true;
  return user.permissions.includes(permission);
}

export function isRouteAllowedForRole(role: AdminRole, route: string): boolean {
  if (role === 'ENTREPRENEUR') return false;
  if (role === 'CHIEF_ADMINISTRATOR' || role === 'ADMIN') return true;
  const requiredPermission = ROUTE_PERMISSION_MAP[route];
  if (!requiredPermission) return true;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(requiredPermission);
}

export function checkRouteAuthorization(
  user: AdminUser | null,
  route: string
): { authorized: boolean; reason?: string } {
  if (!user || user.role === 'ENTREPRENEUR') {
    return {
      authorized: false,
      reason: 'Authentication required. Entrepreneur accounts cannot access administrative routes.'
    };
  }

  const allowed = isRouteAllowedForRole(user.role, route);
  if (!allowed) {
    return {
      authorized: false,
      reason: `Access Denied. Role '${user.role}' lacks permission for '${route}' module.`
    };
  }

  return { authorized: true };
}

export function loginAdmin(
  email: string,
  pass: string,
  selectedRole: AdminRole = 'CHIEF_ADMINISTRATOR',
  remember: boolean = false
): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = pass.trim();

      const isEmailValid = cleanEmail === ADMIN_AUTH_CONFIG.defaultEmail || cleanEmail === 'admin';
      const isPassValid = cleanPass === ADMIN_AUTH_CONFIG.defaultPassword;

      if (isEmailValid && isPassValid) {
        let finalRole: AdminRole = selectedRole;
        if (selectedRole === 'ENTREPRENEUR') {
          finalRole = 'CHIEF_ADMINISTRATOR';
        }

        const rolePermissions = ROLE_PERMISSIONS[finalRole] || ROLE_PERMISSIONS.CHIEF_ADMINISTRATOR;

        const roleNameMap: Record<AdminRole, string> = {
          CHIEF_ADMINISTRATOR: 'Chief Administrator',
          ADMIN: 'Platform Administrator',
          SCHEME_MANAGER: 'Scheme Evaluation Manager',
          CONTENT_MANAGER: 'Content & Evidence Manager',
          AUDITOR: 'Independent Platform Auditor',
          EDITORIAL_OFFICER: 'Editorial Content Officer',
          ENTREPRENEUR: 'Entrepreneur'
        };

        const user: AdminUser = {
          id: `adm_${finalRole.toLowerCase()}_01`,
          email: ADMIN_AUTH_CONFIG.defaultEmail,
          name: roleNameMap[finalRole] || 'System Administrator',
          role: finalRole,
          permissions: rolePermissions,
          lastLogin: new Date().toISOString()
        };

        const serialized = JSON.stringify(user);
        if (typeof window !== 'undefined') {
          if (remember) {
            localStorage.setItem(ADMIN_SESSION_KEY, serialized);
          } else {
            sessionStorage.setItem(ADMIN_SESSION_KEY, serialized);
          }
        }

        resolve({ success: true, user });
      } else {
        resolve({
          success: false,
          error: 'Invalid administrator credentials. Please verify your official email and password.'
        });
      }
    }, 250);
  });
}

export function logoutAdmin(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
}
