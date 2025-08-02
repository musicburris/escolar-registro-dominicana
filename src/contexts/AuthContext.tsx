
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthState, UserRole } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string, role: UserRole) => Promise<boolean>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  getUserHistory: () => Promise<any[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Cambiado a false para acceso inmediato

  // Transform Supabase user and profile to our User type
  const transformUser = (supabaseUser: SupabaseUser, profile: any): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      role: profile?.role as UserRole || 'student',
      phone: profile?.phone || '',
      isActive: profile?.is_active ?? true,
      assignedSections: profile?.assigned_sections || [],
      createdAt: new Date(profile?.created_at || supabaseUser.created_at),
      updatedAt: new Date(profile?.updated_at || supabaseUser.updated_at || supabaseUser.created_at)
    };
  };

  // Get user profile from database
  const getUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Permitir acceso inmediato sin autenticación requerida
    setIsLoading(false);
    
    // Set up auth state listener (opcional)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        
        if (session?.user) {
          // Get user profile
          const profile = await getUserProfile(session.user.id);
          if (profile) {
            const transformedUser = transformUser(session.user, profile);
            setUser(transformedUser);
            setIsAuthenticated(true);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    // Check for existing session (opcional, no bloquea el acceso)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await getUserProfile(session.user.id);
        if (profile) {
          const transformedUser = transformUser(session.user, profile);
          setUser(transformedUser);
          setIsAuthenticated(true);
        }
      }
    }).catch(error => {
      console.error('Error getting session:', error);
      // Continúa sin bloquear
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Usuarios de demostración - simulación para demo
      const demoUsers = {
        'director@ejemplo.edu.do': {
          id: 'demo-admin-001',
          email: 'director@ejemplo.edu.do',
          firstName: 'Director',
          lastName: 'Sistema',
          role: 'admin' as UserRole,
          phone: '+1-809-000-0001',
          avatar: '',
          isActive: true,
          assignedSections: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        'profesor@ejemplo.edu.do': {
          id: 'demo-teacher-001',
          email: 'profesor@ejemplo.edu.do',
          firstName: 'Profesor',
          lastName: 'Demostración',
          role: 'teacher' as UserRole,
          phone: '+1-809-000-0002',
          avatar: '',
          isActive: true,
          assignedSections: ['1A', '2B'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        'auxiliar@ejemplo.edu.do': {
          id: 'demo-auxiliary-001',
          email: 'auxiliar@ejemplo.edu.do',
          firstName: 'Auxiliar',
          lastName: 'Administrativo',
          role: 'auxiliary' as UserRole,
          phone: '+1-809-000-0003',
          avatar: '',
          isActive: true,
          assignedSections: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        'padre@ejemplo.com': {
          id: 'demo-parent-001',
          email: 'padre@ejemplo.com',
          firstName: 'Padre',
          lastName: 'Familia',
          role: 'parent' as UserRole,
          phone: '+1-809-000-0004',
          avatar: '',
          isActive: true,
          assignedSections: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        '202300001': {
          id: 'demo-student-001',
          email: '202300001',
          firstName: 'Estudiante',
          lastName: 'Demo',
          role: 'student' as UserRole,
          phone: '+1-809-000-0005',
          avatar: '',
          isActive: true,
          assignedSections: ['1A'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      // Verificar si es usuario de demostración
      if (demoUsers[email as keyof typeof demoUsers] && password === 'demo123') {
        const demoUser = demoUsers[email as keyof typeof demoUsers];
        setUser(demoUser);
        setIsAuthenticated(true);
        
        // Crear sesión simulada
        setSession({
          access_token: 'demo-token-' + demoUser.id,
          refresh_token: 'demo-refresh-' + demoUser.id,
          expires_in: 3600,
          expires_at: Date.now() + 3600000,
          token_type: 'bearer',
          user: {
            id: demoUser.id,
            email: demoUser.email,
            user_metadata: {
              firstName: demoUser.firstName,
              lastName: demoUser.lastName,
              role: demoUser.role
            }
          }
        } as any);
        
        console.log('Demo login successful for:', email);
        return true;
      }

      // Intentar login real con Supabase para usuarios reales
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        return false;
      }

      if (data.user) {
        const profile = await getUserProfile(data.user.id);
        if (profile) {
          const transformedUser = transformUser(data.user, profile);
          setUser(transformedUser);
          setIsAuthenticated(true);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string, 
    role: UserRole
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            role
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Signup error:', error.message);
        return false;
      }

      // The profile will be created automatically by the trigger
      return true;
    } catch (error) {
      console.error('Error en signup:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (!user || !session) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw new Error(error.message);
      }

      // Update local state
      setUser(prev => prev ? { ...prev, ...userData, updatedAt: new Date() } : null);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  };

  const getAllUsers = async (): Promise<User[]> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, auth.users!inner(email, created_at)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      return data.map((profile: any) => ({
        id: profile.id,
        email: profile.users?.email || '',
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        role: profile.role as UserRole,
        phone: profile.phone || '',
        isActive: profile.is_active,
        assignedSections: profile.assigned_sections || [],
        createdAt: new Date(profile.created_at),
        updatedAt: new Date(profile.updated_at)
      }));
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  };

  const getUserHistory = async (): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching user history:', error);
        return [];
      }

      return data.map((log: any) => ({
        id: log.id,
        userId: log.user_id,
        userName: log.user_name,
        action: log.action,
        module: 'sistema',
        details: log.details?.description || log.action,
        timestamp: new Date(log.created_at),
        status: 'success',
        ipAddress: log.ip_address
      }));
    } catch (error) {
      console.error('Error getting user history:', error);
      return [];
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated,
      isLoading,
      login,
      logout,
      signup,
      updateUser,
      changePassword,
      getAllUsers,
      getUserHistory
    }}>
      {children}
    </AuthContext.Provider>
  );
};
