import { api, setTokens } from './api';
import { clientAuth, googleProvider, signInWithPopup } from '@/lib/firebase-client';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  // Google sign in sequence
  loginWithGoogle: async (role?: string): Promise<AuthResponse> => {
    const userCredential = await signInWithPopup(clientAuth, googleProvider);
    const idToken = await userCredential.user.getIdToken();
    
    const response = await api.post('/auth/login', { firebaseToken: idToken, role });
    const data = response.data.data;
    setTokens(data.accessToken, data.refreshToken);
    return data;
  },

  // Register with custom role
  registerUser: async (name: string, email: string, role: string, phone?: string): Promise<AuthResponse> => {
    // Note: For dev flow, we sign up with custom credentials, then get Token
    // In production we would register through verification token.
    const mockToken = "dev-registration-token-" + Date.now();
    const response = await api.post('/auth/register', {
      name,
      email,
      role,
      phone,
      firebaseToken: mockToken,
    });
    const data = response.data.data;
    setTokens(data.accessToken, data.refreshToken);
    return data;
  },

  // Direct login
  loginWithFirebaseToken: async (idToken: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { firebaseToken: idToken });
    const data = response.data.data;
    setTokens(data.accessToken, data.refreshToken);
    return data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data.data;
  },

  updateProfile: async (profileData: any) => {
    const response = await api.patch('/users/me', profileData);
    return response.data.data;
  },

  uploadAvatar: async (avatarUrl: string) => {
    const response = await api.post('/users/me/avatar', { avatarUrl });
    return response.data.data;
  },

  logout: async () => {
    try {
      const currentRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('cr_refresh_token') : null;
      if (currentRefreshToken) {
        await api.post('/auth/logout', { refreshToken: currentRefreshToken });
      }
    } catch (e) {
      console.warn("Server-side logout session deletion failed/ignored:", e);
    } finally {
      await signOut(clientAuth);
      setTokens(null, null);
    }
  }
};
