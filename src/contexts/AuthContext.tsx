
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, UserRole } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  getAllUsers: () => User[];
  getUserHistory: () => any[];
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Test users with complete User type structure
      const testUsers: User[] = [
        { 
          id: '1', 
          firstName: 'Admin', 
          lastName: 'Sistema',
          email: 'admin@test.com', 
          role: 'admin' as UserRole,
          phone: '809-555-0001',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date()
        },
        { 
          id: '2', 
          firstName: 'María', 
          lastName: 'González',
          email: 'teacher@test.com', 
          role: 'teacher' as UserRole,
          phone: '809-555-0002',
          isActive: true,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date()
        },
        { 
          id: '3', 
          firstName: 'Carmen', 
          lastName: 'Pérez',
          email: 'aux@test.com', 
          role: 'auxiliary' as UserRole,
          phone: '809-555-0003',
          isActive: true,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date()
        },
        { 
          id: '4', 
          firstName: 'Juan', 
          lastName: 'Rodríguez',
          email: 'parent@test.com', 
          role: 'parent' as UserRole,
          phone: '809-555-0004',
          isActive: true,
          createdAt: new Date('2024-02-15'),
          updatedAt: new Date()
        },
        { 
          id: '5', 
          firstName: 'Ana', 
          lastName: 'Martínez',
          email: 'student@test.com', 
          role: 'student' as UserRole,
          phone: '809-555-0005',
          isActive: true,
          createdAt: new Date('2024-03-01'),
          updatedAt: new Date()
        }
      ];

      const foundUser = testUsers.find(u => u.email === email);
      
      if (foundUser && password === '123456') {
        setUser(foundUser);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData, updatedAt: new Date() };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    // Simulate password change
    if (currentPassword !== '123456') {
      throw new Error('Contraseña actual incorrecta');
    }
    
    // In a real app, this would make an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Password changed successfully');
  };

  const getAllUsers = (): User[] => {
    // Mock users data
    return [
      { 
        id: '1', 
        firstName: 'Admin', 
        lastName: 'Sistema',
        email: 'admin@test.com', 
        role: 'admin' as UserRole,
        phone: '809-555-0001',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      },
      { 
        id: '2', 
        firstName: 'María', 
        lastName: 'González',
        email: 'teacher@test.com', 
        role: 'teacher' as UserRole,
        phone: '809-555-0002',
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date()
      },
      { 
        id: '3', 
        firstName: 'Carmen', 
        lastName: 'Pérez',
        email: 'aux@test.com', 
        role: 'auxiliary' as UserRole,
        phone: '809-555-0003',
        isActive: true,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date()
      },
      { 
        id: '4', 
        firstName: 'Juan', 
        lastName: 'Rodríguez',
        email: 'parent@test.com', 
        role: 'parent' as UserRole,
        phone: '809-555-0004',
        isActive: true,
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date()
      },
      { 
        id: '5', 
        firstName: 'Ana', 
        lastName: 'Martínez',
        email: 'student@test.com', 
        role: 'student' as UserRole,
        phone: '809-555-0005',
        isActive: true,
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date()
      }
    ];
  };

  const getUserHistory = () => {
    // Mock history data
    return [
      {
        id: '1',
        userId: '1',
        userName: 'Admin Sistema',
        action: 'Inicio de sesión',
        module: 'autenticacion',
        details: 'Usuario administrador inició sesión exitosamente',
        timestamp: new Date('2024-12-10T10:30:00'),
        status: 'success',
        ipAddress: '192.168.1.1'
      },
      {
        id: '2',
        userId: '2',
        userName: 'María González',
        action: 'Actualización de perfil',
        module: 'perfil',
        details: 'Actualizó información de contacto',
        timestamp: new Date('2024-12-10T09:15:00'),
        status: 'success',
        ipAddress: '192.168.1.2'
      },
      {
        id: '3',
        userId: '1',
        userName: 'Admin Sistema',
        action: 'Gestión de usuarios',
        module: 'usuarios',
        details: 'Modificó estado de usuario',
        timestamp: new Date('2024-12-09T16:45:00'),
        status: 'warning',
        ipAddress: '192.168.1.1'
      }
    ];
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      updateUser,
      changePassword,
      getAllUsers,
      getUserHistory
    }}>
      {children}
    </AuthContext.Provider>
  );
};
