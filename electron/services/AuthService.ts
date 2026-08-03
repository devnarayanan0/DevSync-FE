import { getApiClient } from './ApiClient';
import { getSetting, setSetting, deleteSetting } from './DatabaseService';

export class AuthService {
  static async register(name: string, email: string, password: string): Promise<boolean> {
    try {
      const client = getApiClient();
      const response = await client.post('/api/auth/register', { name, email, password });
      return !!response.data;
    } catch (err: any) {
      console.error('[AuthService] Registration failed:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || 'Registration failed');
    }
  }

  static async login(email: string, password: string): Promise<any> {
    try {
      const client = getApiClient();
      const response = await client.post('/api/auth/login', { email, password });
      
      const userData = response.data;
      if (userData && userData.token) {
        setSetting('jwt_token', userData.token);
        setSetting('is_logged_in', 'true');
        setSetting('user_profile', JSON.stringify({
          id: userData.id,
          email: userData.email,
          role: userData.role
        }));
        console.log(`[AuthService] Login successful for: ${email}`);
        return userData;
      }
      throw new Error('Invalid server login response. Token is missing.');
    } catch (err: any) {
      console.error('[AuthService] Login failed:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || 'Login failed');
    }
  }

  static async logout(): Promise<void> {
    try {
      setSetting('jwt_token', '');
      setSetting('is_logged_in', 'false');
      setSetting('user_profile', '');
      // Clear tenant settings too on explicit logout if required
      deleteSetting('tenant_id');
      deleteSetting('tenant_name');
      deleteSetting('tenant_provider');
      deleteSetting('tenant_status');
      console.log('[AuthService] Logout complete. Session cleared.');
    } catch (err: any) {
      console.error('[AuthService] Logout error:', err);
    }
  }

  static getSession(): { isLoggedIn: boolean; token: string; user: any | null } {
    const isLoggedIn = getSetting('is_logged_in') === 'true';
    const token = getSetting('jwt_token');
    const profileRaw = getSetting('user_profile');
    let user = null;
    if (profileRaw) {
      try {
        user = JSON.parse(profileRaw);
      } catch (e) {
        console.error('[AuthService] Failed to parse user profile setting:', e);
      }
    }
    return {
      isLoggedIn: isLoggedIn && !!token,
      token,
      user
    };
  }
}
