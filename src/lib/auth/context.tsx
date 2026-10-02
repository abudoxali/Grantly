'use client';

import * as React from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Profile, UserRole } from '@/lib/supabase/types';
import { getProfile, updateProfile } from '@/lib/db/repository';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  profile: Profile | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<{ error?: string; user?: AuthUser }>;
  register: (
    email: string,
    password?: string,
    fullName?: string,
    language?: 'en' | 'ar'
  ) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const supabase = React.useMemo(() => createClient(), []);

  // Initialize session on mount
  React.useEffect(() => {
    async function initAuth() {
      setIsLoading(true);

      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const dbProfile = await getProfile(session.user.id);
            const userProfile: Profile = dbProfile || {
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || null,
              role: (session.user.user_metadata?.role as UserRole) || 'user',
              preferred_language:
                (session.user.user_metadata?.preferred_language as 'en' | 'ar') || 'en',
              country: null,
              degree_level: null,
              academic_field: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            setUser({
              id: session.user.id,
              email: session.user.email || '',
              role: userProfile.role,
              profile: userProfile,
            });
            setProfile(userProfile);
            if (typeof document !== 'undefined') {
              document.cookie = `grantly_session_role=${userProfile.role}; path=/; max-age=86400; SameSite=Lax`;
            }
          } else {
            if (typeof document !== 'undefined') {
              document.cookie = 'grantly_session_role=; path=/; max-age=0; SameSite=Lax';
            }
          }
        } catch (err) {
          console.error('Error fetching Supabase session:', err);
        }
      } else {
        // Check for local session in localStorage
        try {
          const stored = localStorage.getItem('grantly_mock_session');
          if (stored) {
            const parsed = JSON.parse(stored);
            setUser(parsed);
            setProfile(parsed.profile);
            if (typeof document !== 'undefined') {
              document.cookie = `grantly_session_role=${parsed.role}; path=/; max-age=86400; SameSite=Lax`;
            }
          } else {
            if (typeof document !== 'undefined') {
              document.cookie = 'grantly_session_role=; path=/; max-age=0; SameSite=Lax';
            }
          }
        } catch {
          // Ignore
        }
      }

      setIsLoading(false);
    }

    initAuth();
  }, [supabase]);

  const login = async (
    email: string,
    password?: string
  ): Promise<{ error?: string; user?: AuthUser }> => {
    setIsLoading(true);

    if (process.env.NODE_ENV === 'production' && !isSupabaseConfigured) {
      setIsLoading(false);
      return {
        error:
          'Supabase credentials are not configured. A real database connection is required in production.',
      };
    }

    if (isSupabaseConfigured && supabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setIsLoading(false);
          return { error: error.message };
        }

        if (data.user) {
          const dbProfile = await getProfile(data.user.id);
          const p: Profile = dbProfile || {
            id: data.user.id,
            email: data.user.email || '',
            full_name: data.user.user_metadata?.full_name || null,
            role: (data.user.user_metadata?.role as UserRole) || 'user',
            preferred_language: 'en',
            country: null,
            degree_level: null,
            academic_field: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || '',
            role: p.role,
            profile: p,
          };
          setUser(authUser);
          setProfile(p);
          if (typeof document !== 'undefined') {
            document.cookie = `grantly_session_role=${authUser.role}; path=/; max-age=86400; SameSite=Lax`;
          }
          setIsLoading(false);
          return { user: authUser };
        }
      } catch (err: unknown) {
        setIsLoading(false);
        return { error: err instanceof Error ? err.message : 'Login failed' };
      }
    }

    // Offline / Demo authentication fallback (non-production only)
    const role: UserRole = email.toLowerCase().includes('admin') ? 'admin' : 'user';
    const mockProfile: Profile = {
      id: role === 'admin' ? 'admin-seed-id' : `user-${Date.now()}`,
      email,
      full_name: role === 'admin' ? 'Grantly Administrator' : 'Student Scholar',
      role,
      preferred_language: 'en',
      country: 'United Kingdom',
      degree_level: 'Master',
      academic_field: 'Computer Science',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const authUser: AuthUser = {
      id: mockProfile.id,
      email,
      role,
      profile: mockProfile,
    };

    setUser(authUser);
    setProfile(mockProfile);
    try {
      localStorage.setItem('grantly_mock_session', JSON.stringify(authUser));
      if (typeof document !== 'undefined') {
        document.cookie = `grantly_session_role=${authUser.role}; path=/; max-age=86400; SameSite=Lax`;
      }
    } catch {
      // Ignore
    }

    setIsLoading(false);
    return { user: authUser };
  };

  const register = async (
    email: string,
    password?: string,
    fullName?: string,
    language: 'en' | 'ar' = 'en'
  ): Promise<{ error?: string }> => {
    setIsLoading(true);

    if (isSupabaseConfigured && supabase && password) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              preferred_language: language,
              role: 'user',
            },
          },
        });

        if (error) {
          setIsLoading(false);
          return { error: error.message };
        }

        if (data.user) {
          const newProfile: Profile = {
            id: data.user.id,
            email: data.user.email || '',
            full_name: fullName || null,
            role: 'user',
            preferred_language: language,
            country: null,
            degree_level: null,
            academic_field: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || '',
            role: 'user',
            profile: newProfile,
          };
          setUser(authUser);
          setProfile(newProfile);
          setIsLoading(false);
          return {};
        }
      } catch (err: unknown) {
        setIsLoading(false);
        return { error: err instanceof Error ? err.message : 'Registration failed' };
      }
    }

    // Fallback registration
    const newProfile: Profile = {
      id: `user-${Date.now()}`,
      email,
      full_name: fullName || 'Scholar Student',
      role: 'user',
      preferred_language: language,
      country: null,
      degree_level: null,
      academic_field: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const authUser: AuthUser = {
      id: newProfile.id,
      email,
      role: 'user',
      profile: newProfile,
    };

    setUser(authUser);
    setProfile(newProfile);
    try {
      localStorage.setItem('grantly_mock_session', JSON.stringify(authUser));
    } catch {
      // Ignore
    }

    setIsLoading(false);
    return {};
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore
      }
    }
    try {
      localStorage.removeItem('grantly_mock_session');
    } catch {
      // Ignore
    }
    if (typeof document !== 'undefined') {
      document.cookie = 'grantly_session_role=; path=/; max-age=0; SameSite=Lax';
    }
    setUser(null);
    setProfile(null);
  };

  const updateUserProfile = async (
    updates: Partial<Profile>
  ): Promise<{ error?: string }> => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const updated = await updateProfile(user.id, updates);
      if (updated) {
        setProfile(updated);
        setUser((prev) => (prev ? { ...prev, profile: updated } : null));
        return {};
      }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to update profile' };
    }
    return { error: 'Failed to update profile' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAdmin: user?.role === 'admin' || profile?.role === 'admin',
        login,
        register,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
