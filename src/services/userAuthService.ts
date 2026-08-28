/**
 * UDYORA User Authentication, Profile & Saved Assessment Database Service
 * Provides secure user identity, canonical mobile & email normalization,
 * uniqueness constraints, session persistence, and assessment provenance.
 */

import { SupportedLanguage } from '../i18n/types';

export interface UserProfile {
  userId: string;
  name: string;
  mobile: string;
  normalizedMobile: string;
  email?: string;
  normalizedEmail?: string;
  preferredLanguage: SupportedLanguage;
  state?: string;
  district?: string;
  mandal?: string;
  role?: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface SavedAssessment {
  assessmentId: string;
  userId: string;
  userName: string;
  userMobile: string;
  createdAt: string;
  updatedAt: string;
  state: string;
  district: string;
  mandal: string;
  pincode: string;
  latitude: number;
  longitude: number;
  businessType: string;
  businessIdea?: string;
  businessDescription: string;
  availableCapital: number;
  feasibilityScore: number;
  dataConfidence: number;
  recommendedAction: string;
}

const USER_SESSION_KEY = 'udyora_user_session';
const USER_PROFILES_KEY = 'udyora_registered_users';
const ASSESSMENTS_KEY = 'udyora_saved_assessments';

// Canonical Normalization Utilities
export function normalizeMobile(mobile: string): string {
  if (!mobile) return '';
  const digits = mobile.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  if (digits.length > 10) {
    return digits.slice(-10);
  }
  return digits;
}

export function normalizeEmail(email?: string): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}

// Seed Initial User Repository
function getSeedUsers(): UserProfile[] {
  return [
    {
      userId: 'usr_demo_01',
      name: 'Test Entrepreneur 1',
      mobile: '9800000001',
      normalizedMobile: '9800000001',
      email: 'testuser1@example.invalid',
      normalizedEmail: 'testuser1@example.invalid',
      preferredLanguage: 'en',
      state: 'Maharashtra',
      district: 'Pune',
      mandal: 'Haveli',
      role: 'USER',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
    }
  ];
}

function getSeedAssessments(): SavedAssessment[] {
  return [
    {
      assessmentId: 'UDY-DEMO-8701',
      userId: 'usr_demo_01',
      userName: 'Ramesh Patil',
      userMobile: '9822012345',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      state: 'Maharashtra',
      district: 'Pune',
      mandal: 'Haveli',
      pincode: '412801',
      latitude: 18.3517,
      longitude: 73.8567,
      businessType: 'dairy',
      businessIdea: 'Commercial Micro Dairy Farming with 8-10 high-yield milch cows.',
      businessDescription: 'Commercial Micro Dairy Farming with 8-10 high-yield milch cows.',
      availableCapital: 100000,
      feasibilityScore: 87,
      dataConfidence: 96,
      recommendedAction: 'PROCEED WITH PMEGP 35% RURAL SUBSIDY APPLICATION'
    }
  ];
}

let inMemoryUsers: UserProfile[] = getSeedUsers();
let inMemoryAssessments: SavedAssessment[] = getSeedAssessments();
let inMemoryActiveSession: UserProfile | null = null;

const getGlobalStorage = (): Map<string, string> => {
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).__udyora_storage__ = (globalThis as any).__udyora_storage__ || new Map<string, string>();
    return (globalThis as any).__udyora_storage__;
  }
  return new Map<string, string>();
};

function getStorageData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    const store = getGlobalStorage();
    const raw = store.get(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setStorageData<T>(key: string, data: T): void {
  const serialized = JSON.stringify(data);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, serialized);
    } catch {}
  }
  getGlobalStorage().set(key, serialized);
}

export function getRegisteredUsers(): UserProfile[] {
  const users = getStorageData(USER_PROFILES_KEY, getSeedUsers());
  return users.map((u: any) => ({
    ...u,
    userId: u.userId || u.id,
    normalizedMobile: u.normalizedMobile || normalizeMobile(u.mobile),
    normalizedEmail: u.normalizedEmail || normalizeEmail(u.email)
  }));
}

export function getCurrentUserSession(): UserProfile | null {
  if (typeof window === 'undefined') return inMemoryActiveSession;
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY) || sessionStorage.getItem(USER_SESSION_KEY);
    if (!raw) return inMemoryActiveSession;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return inMemoryActiveSession;
  }
}

export function findUserByIdentifier(identifier: string): UserProfile | undefined {
  const users = getRegisteredUsers();
  const clean = identifier.trim();
  const normMob = normalizeMobile(clean);
  const normEm = normalizeEmail(clean);

  return users.find((u) => {
    if (normMob && u.normalizedMobile === normMob) return true;
    if (normEm && u.normalizedEmail === normEm) return true;
    return false;
  });
}

export function registerUser(profileInput: {
  name: string;
  mobile: string;
  email?: string;
  preferredLanguage?: SupportedLanguage;
  state?: string;
  district?: string;
  mandal?: string;
}): { success: boolean; user?: UserProfile; error?: string; errorCode?: string } {
  const users = getRegisteredUsers();
  const normMob = normalizeMobile(profileInput.mobile);
  const normEm = normalizeEmail(profileInput.email);

  if (!normMob || normMob.length < 10) {
    return {
      success: false,
      error: 'Please enter a valid 10-digit mobile number.',
      errorCode: 'INVALID_MOBILE'
    };
  }

  // Check UNIQUE(normalizedMobile)
  const existingMobile = users.find((u) => u.normalizedMobile === normMob);
  if (existingMobile) {
    if (existingMobile.status === 'SUSPENDED') {
      return {
        success: false,
        error: 'Your account has been suspended by administration. Registration is blocked.',
        errorCode: 'ACCOUNT_SUSPENDED'
      };
    }
    return {
      success: false,
      error: 'An account already exists with this mobile number.',
      errorCode: 'DUPLICATE_MOBILE',
      user: existingMobile
    };
  }

  // Check UNIQUE(normalizedEmail) if email is provided
  if (normEm) {
    const existingEmail = users.find((u) => u.normalizedEmail && u.normalizedEmail === normEm);
    if (existingEmail) {
      if (existingEmail.status === 'SUSPENDED') {
        return {
          success: false,
          error: 'Your account has been suspended by administration. Registration is blocked.',
          errorCode: 'ACCOUNT_SUSPENDED'
        };
      }
      return {
        success: false,
        error: 'An account already exists with this email address.',
        errorCode: 'DUPLICATE_EMAIL',
        user: existingEmail
      };
    }
  }

  const newUser: UserProfile = {
    userId: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    name: profileInput.name.trim(),
    mobile: profileInput.mobile.trim(),
    normalizedMobile: normMob,
    email: profileInput.email?.trim() || undefined,
    normalizedEmail: normEm || undefined,
    preferredLanguage: profileInput.preferredLanguage || 'en',
    state: profileInput.state,
    district: profileInput.district,
    mandal: profileInput.mandal,
    role: 'USER',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updatedUsers = [newUser, ...users];
  setStorageData(USER_PROFILES_KEY, updatedUsers);
  setStorageData(USER_SESSION_KEY, newUser);

  return { success: true, user: newUser };
}

export function loginUserSession(identifier: string): {
  success: boolean;
  user?: UserProfile;
  error?: string;
  errorCode?: string;
} {
  const user = findUserByIdentifier(identifier);
  if (!user) {
    return {
      success: false,
      error: 'No registered user found with this mobile or email.',
      errorCode: 'NOT_FOUND'
    };
  }

  if (user.status === 'SUSPENDED') {
    return {
      success: false,
      error: 'Your account has been suspended by administration. Please contact support.',
      errorCode: 'ACCOUNT_SUSPENDED'
    };
  }

  inMemoryActiveSession = user;
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
  }

  return { success: true, user };
}

export function logoutUserSession(): void {
  inMemoryActiveSession = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_SESSION_KEY);
    sessionStorage.removeItem(USER_SESSION_KEY);
  }
}

export function updateUserProfileStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED'): void {
  const users = getRegisteredUsers();
  const u = users.find((item) => item.userId === userId || (item as any).id === userId);
  if (u) {
    u.status = status;
    setStorageData(USER_PROFILES_KEY, users);
  }
}

export function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): { success: boolean; user?: UserProfile; error?: string } {
  const users = getRegisteredUsers();
  const existingIndex = users.findIndex((u) => u.userId === userId);
  if (existingIndex === -1) return { success: false, error: 'User profile not found.' };

  const existing = users[existingIndex];

  // If mobile changed, check uniqueness
  if (updates.mobile && updates.mobile !== existing.mobile) {
    const newNorm = normalizeMobile(updates.mobile);
    if (users.some((u) => u.userId !== userId && u.normalizedMobile === newNorm)) {
      return { success: false, error: 'An account already exists with this mobile number.' };
    }
    existing.mobile = updates.mobile.trim();
    existing.normalizedMobile = newNorm;
  }

  // If email changed, check uniqueness
  if (updates.email !== undefined && updates.email !== existing.email) {
    const newNormEm = normalizeEmail(updates.email);
    if (newNormEm && users.some((u) => u.userId !== userId && u.normalizedEmail === newNormEm)) {
      return { success: false, error: 'An account already exists with this email address.' };
    }
    existing.email = updates.email.trim() || undefined;
    existing.normalizedEmail = newNormEm || undefined;
  }

  if (updates.name) existing.name = updates.name.trim();
  if (updates.preferredLanguage) existing.preferredLanguage = updates.preferredLanguage;
  if (updates.state) existing.state = updates.state;
  if (updates.district) existing.district = updates.district;
  if (updates.mandal) existing.mandal = updates.mandal;
  existing.updatedAt = new Date().toISOString();

  users[existingIndex] = existing;
  inMemoryUsers = users;

  if (inMemoryActiveSession?.userId === userId) {
    inMemoryActiveSession = existing;
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_PROFILES_KEY, JSON.stringify(users));
    if (getCurrentUserSession()?.userId === userId) {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(existing));
    }
  }

  return { success: true, user: existing };
}

export function saveAssessmentRecord(
  assessmentData: Omit<SavedAssessment, 'assessmentId' | 'createdAt' | 'updatedAt'>
): SavedAssessment {
  const all = getSavedAssessments();
  const newRecord: SavedAssessment = {
    ...assessmentData,
    assessmentId: `UDY-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updated = [newRecord, ...all];
  inMemoryAssessments = updated;
  if (typeof window !== 'undefined') {
    localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(updated));
  }
  return newRecord;
}

export function getSavedAssessments(): SavedAssessment[] {
  if (typeof window === 'undefined') return inMemoryAssessments;
  try {
    const raw = localStorage.getItem(ASSESSMENTS_KEY);
    if (!raw) {
      localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(inMemoryAssessments));
      return inMemoryAssessments;
    }
    return JSON.parse(raw) as SavedAssessment[];
  } catch {
    return inMemoryAssessments;
  }
}

export function getUserAssessments(userId: string): SavedAssessment[] {
  return getSavedAssessments().filter((a) => a.userId === userId);
}

export function checkDuplicateIdentitiesDiagnostic(): {
  duplicateMobileCount: number;
  duplicateEmailCount: number;
  details: string[];
} {
  const users = getRegisteredUsers();
  const mobileMap = new Map<string, string[]>();
  const emailMap = new Map<string, string[]>();

  users.forEach((u) => {
    if (u.normalizedMobile) {
      const existing = mobileMap.get(u.normalizedMobile) || [];
      mobileMap.set(u.normalizedMobile, [...existing, u.userId]);
    }
    if (u.normalizedEmail) {
      const existing = emailMap.get(u.normalizedEmail) || [];
      emailMap.set(u.normalizedEmail, [...existing, u.userId]);
    }
  });

  let duplicateMobileCount = 0;
  let duplicateEmailCount = 0;
  const details: string[] = [];

  mobileMap.forEach((ids, mob) => {
    if (ids.length > 1) {
      duplicateMobileCount++;
      details.push(`Duplicate Mobile [${mob}]: User IDs (${ids.join(', ')})`);
    }
  });

  emailMap.forEach((ids, em) => {
    if (ids.length > 1) {
      duplicateEmailCount++;
      details.push(`Duplicate Email [${em}]: User IDs (${ids.join(', ')})`);
    }
  });

  return { duplicateMobileCount, duplicateEmailCount, details };
}

export function loginUserWithMobile(mobile: string, name?: string): UserProfile {
  const normMob = normalizeMobile(mobile);
  const existing = findUserByIdentifier(normMob);
  if (existing) {
    loginUserSession(normMob);
    return existing;
  }
  const res = registerUser({ name: name || 'Entrepreneur', mobile: normMob });
  return res.user || getRegisteredUsers()[0];
}
