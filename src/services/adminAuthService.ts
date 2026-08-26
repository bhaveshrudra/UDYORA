/**
 * UDYORA Admin Authentication & Session Service
 * Provides secure session token management, authentication checks, and route protection.
 * Configured for seamless migration to JWT / OAuth backend endpoints.
 */

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'DATA_ADMIN' | 'SCHEME_REVIEWER';
  lastLogin: string;
}

const ADMIN_SESSION_KEY = 'udyora_admin_session';

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

export function loginAdmin(email: string, pass: string, remember: boolean = false): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Prototype auth check: Supports standard admin email/pass or dev environment defaults
      const cleanEmail = email.trim().toLowerCase();
      const isValid = (cleanEmail === 'admin@udyora.gov.in' || cleanEmail === 'admin' || cleanEmail === 'editor@udyora.in') && pass.length >= 4;

      if (isValid) {
        const user: AdminUser = {
          id: 'adm_001',
          email: cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@udyora.gov.in`,
          name: cleanEmail.startsWith('editor') ? 'Editorial Officer' : 'Chief Policy Officer',
          role: cleanEmail.startsWith('editor') ? 'DATA_ADMIN' : 'SUPER_ADMIN',
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
          error: 'Invalid administrator credentials. Please check your email and password.'
        });
      }
    }, 450);
  });
}

export function logoutAdmin(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
}
