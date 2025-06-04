
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, LoginCredentials, UserRole } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo purposes
const mockUsers: User[] = [
  {
    id: '1',
    email: 'director@ejemplo.edu.do',
    firstName: 'María',
    lastName: 'González',
    role: 'admin',
    phone: '809-555-0001',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    email: 'profesor@ejemplo.edu.do',
    firstName: 'Carlos',
    lastName: 'Martínez',
    role: 'teacher',
    phone: '809-555-0002',
    isActive: true,
    assignedSections: ['1A', '2B'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    email: 'auxiliar@ejemplo.edu.do',
    firstName: 'Ana',
    lastName: 'Rodríguez',
    role: 'auxiliary',
    phone: '809-555-0003',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    email: 'padre@ejemplo.com',
    firstName: 'Juan',
    lastName: 'Pérez',
    role: 'parent',
    phone: '809-555-0004',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    email: '202300001',
    firstName: 'Sofía',
    lastName: 'Jiménez',
    role: 'student',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for stored auth data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user by email or RNE
      const user = mockUsers.find(u => 
        u.email === credentials.identifier || 
        u.id === credentials.identifier
      );
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Store user data
      localStorage.setItem('user', JSON.stringify(user));
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      throw new Error('Credenciales incorrectas');
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateUser = (userData: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    }
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
