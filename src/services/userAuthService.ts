/**
 * UDYORA User Authentication, Profile & Saved Assessment Database Service
 * Provides secure user session management, profile storage, assessment history,
 * and role-governed data queries.
 */

export interface UserProfile {
  userId: string;
  name: string;
  mobile: string;
  email?: string;
  preferredLanguage: 'en' | 'hi' | 'mr' | 'te' | 'kn';
  state?: string;
  district?: string;
  mandal?: string;
  role?: 'USER' | 'ADMIN';
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

// Seed initial default user & demo assessments if empty
function getSeedUsers(): UserProfile[] {
  return [
    {
      userId: 'usr_demo_01',
      name: 'Ramesh Patil',
      mobile: '9822012345',
      email: 'ramesh.patil@example.com',
      preferredLanguage: 'mr',
      state: 'Maharashtra',
      district: 'Pune',
      mandal: 'Haveli',
      role: 'USER',
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      userId: 'usr_demo_02',
      name: 'Sunita Sharma',
      mobile: '9811098765',
      email: 'sunita.sharma@example.com',
      preferredLanguage: 'hi',
      state: 'Uttar Pradesh',
      district: 'Agra',
      mandal: 'Fatehabad',
      role: 'USER',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
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

export function getRegisteredUsers(): UserProfile[] {
  if (typeof window === 'undefined') return inMemoryUsers;
  try {
    const raw = localStorage.getItem(USER_PROFILES_KEY);
    if (!raw) {
      localStorage.setItem(USER_PROFILES_KEY, JSON.stringify(inMemoryUsers));
      return inMemoryUsers;
    }
    return JSON.parse(raw) as UserProfile[];
  } catch {
    return inMemoryUsers;
  }
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

export function registerUser(profileInput: {
  name: string;
  mobile: string;
  email?: string;
  preferredLanguage?: 'en' | 'hi' | 'mr' | 'te' | 'kn';
  state?: string;
  district?: string;
  mandal?: string;
}): UserProfile {
  const users = getRegisteredUsers();
  const existing = users.find((u) => u.mobile === profileInput.mobile.trim());

  if (existing) {
    const updated: UserProfile = {
      ...existing,
      name: profileInput.name.trim(),
      email: profileInput.email?.trim() || existing.email,
      preferredLanguage: profileInput.preferredLanguage || existing.preferredLanguage,
      state: profileInput.state || existing.state,
      district: profileInput.district || existing.district,
      mandal: profileInput.mandal || existing.mandal,
      updatedAt: new Date().toISOString()
    };
    const newUsers = users.map((u) => (u.userId === existing.userId ? updated : u));
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_PROFILES_KEY, JSON.stringify(newUsers));
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(updated));
    }
    return updated;
  }

  const newUser: UserProfile = {
    userId: `usr_${Date.now()}`,
    name: profileInput.name.trim(),
    mobile: profileInput.mobile.trim(),
    email: profileInput.email?.trim(),
    preferredLanguage: profileInput.preferredLanguage || 'en',
    state: profileInput.state,
    district: profileInput.district,
    mandal: profileInput.mandal,
    role: 'USER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updatedUsers = [newUser, ...users];
  inMemoryUsers = updatedUsers;
  inMemoryActiveSession = newUser;
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_PROFILES_KEY, JSON.stringify(updatedUsers));
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(newUser));
  }
  return newUser;
}

export function loginUserWithMobile(mobile: string, name?: string): UserProfile {
  const users = getRegisteredUsers();
  const existing = users.find((u) => u.mobile === mobile.trim());
  if (existing) {
    inMemoryActiveSession = existing;
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(existing));
    }
    return existing;
  }
  return registerUser({ name: name || 'Entrepreneur', mobile: mobile.trim() });
}

export function logoutUserSession(): void {
  inMemoryActiveSession = null;
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_SESSION_KEY);
  sessionStorage.removeItem(USER_SESSION_KEY);
}

export function saveAssessmentRecord(assessmentData: Omit<SavedAssessment, 'assessmentId' | 'createdAt' | 'updatedAt'>): SavedAssessment {
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
