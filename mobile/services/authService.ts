import { UserProfile } from '../types';
import { api } from './api';

export const authService = {
  /**
   * Prototype Sign In
   */
  async signIn(email: string, pass: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    // Artificial delay for realistic mobile feedback
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Invalid email address.' };
    }
    if (!pass || pass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const isAdmin = email.toLowerCase().includes('admin');
    const user: UserProfile = {
      id: `usr_${Date.now()}`,
      name: isAdmin ? 'Administrative Officer' : email.split('@')[0],
      email: email.trim().toLowerCase(),
      role: isAdmin ? 'admin' : 'user',
      isGuest: false,
      token: `mock_jwt_${Date.now()}_secure_session`,
      createdAt: new Date().toISOString()
    };

    api.setAuthToken(user.token || null);
    return { success: true, user };
  },

  /**
   * Prototype User Registration
   */
  async register(
    name: string,
    phoneOrEmail: string,
    pass: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 700));

    if (!name || name.trim().length < 2) {
      return { success: false, error: 'Name must be at least 2 characters.' };
    }
    if (!phoneOrEmail || phoneOrEmail.trim().length < 5) {
      return { success: false, error: 'Invalid phone or email.' };
    }
    if (!pass || pass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const isEmail = phoneOrEmail.includes('@');
    const user: UserProfile = {
      id: `usr_reg_${Date.now()}`,
      name: name.trim(),
      email: isEmail ? phoneOrEmail.trim().toLowerCase() : undefined,
      phone: !isEmail ? phoneOrEmail.trim() : undefined,
      role: 'user',
      isGuest: false,
      token: `mock_jwt_reg_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    api.setAuthToken(user.token || null);
    return { success: true, user };
  },

  /**
   * Guest Access Mode
   */
  async loginAsGuest(): Promise<UserProfile> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const guestUser: UserProfile = {
      id: `guest_${Date.now()}`,
      name: 'Guest Entrepreneur',
      role: 'guest',
      isGuest: true,
      createdAt: new Date().toISOString()
    };
    api.setAuthToken(null);
    return guestUser;
  },

  async signOut(): Promise<void> {
    api.setAuthToken(null);
  }
};
