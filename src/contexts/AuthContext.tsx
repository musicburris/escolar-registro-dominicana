
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, LoginCredentials, UserRole } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  getAllUsers: () => User[];
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  getUserHistory: () => any[];
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

// Mock user history data
const mockUserHistory = [
  {
    id: '1',
    userId: '1',
    userName: 'María González',
    action: 'Inicio de sesión',
    module: 'Autenticación',
    details: 'Acceso exitoso al sistema',
    timestamp: new Date('2024-12-05T08:30:00'),
    status: 'success',
    ipAddress: '192.168.1.100'
  },
  {
    id: '2',
    userId: '2',
    userName: 'Carlos Martínez',
    action: 'Actualizar calificación',
    module: 'Calificaciones',
    details: 'Calificación actualizada para estudiante Ana López - Matemáticas',
    timestamp: new Date('2024-12-05T09:15:00'),
    status: 'success',
    ipAddress: '192.168.1.101'
  },
  {
    id: '3',
    userId: '3',
    userName: 'Ana Rodríguez',
    action: 'Registrar estudiante',
    module: 'Estudiantes',
    details: 'Nuevo estudiante registrado: Pedro Jiménez',
    timestamp: new Date('2024-12-05T10:00:00'),
    status: 'success',
    ipAddress: '192.168.1.102'
  },
  {
    id: '4',
    userId: '1',
    userName: 'María González',
    action: 'Cambio de contraseña',
    module: 'Perfil',
    details: 'Contraseña actualizada exitosamente',
    timestamp: new Date('2024-12-05T11:30:00'),
    status: 'success',
    ipAddress: '192.168.1.100'
  },
  {
    id: '5',
    userId: '2',
    userName: 'Carlos Martínez',
    action: 'Actualización de perfil',
    module: 'Perfil',
    details: 'Información personal actualizada',
    timestamp: new Date('2024-12-05T12:00:00'),
    status: 'success',
    ipAddress: '192.168.1.101'
  }
];

const parseStoredUser = (storedUser: string): User | null => {
  try {
    const parsed = JSON.parse(storedUser);
    // Convert date strings back to Date objects
    if (parsed.createdAt) {
      parsed.createdAt = new Date(parsed.createdAt);
    }
    if (parsed.updatedAt) {
      parsed.updatedAt = new Date(parsed.updatedAt);
    }
    return parsed;
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const [users, setUsers] = useState<User[]>(mockUsers);

  useEffect(() => {
    // Check for stored auth data
    const storedUser = localStorage.getItem('user');
    const storedUsers = localStorage.getItem('users');
    
    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers);
        setUsers(parsedUsers);
      } catch (error) {
        console.error('Error parsing stored users:', error);
      }
    }

    if (storedUser) {
      const user = parseStoredUser(storedUser);
      if (user) {
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
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
      const user = users.find(u => 
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

      // Log login activity
      const loginActivity = {
        id: Date.now().toString(),
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        action: 'Inicio de sesión',
        module: 'Autenticación',
        details: 'Acceso exitoso al sistema',
        timestamp: new Date(),
        status: 'success',
        ipAddress: '192.168.1.100'
      };
      
      const currentHistory = JSON.parse(localStorage.getItem('userHistory') || '[]');
      localStorage.setItem('userHistory', JSON.stringify([loginActivity, ...currentHistory]));
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
      const updatedUser = { 
        ...authState.user, 
        ...userData,
        updatedAt: new Date()
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update in users list
      const updatedUsers = users.map(u => 
        u.id === updatedUser.id ? updatedUser : u
      );
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));

      // Log update activity
      const updateActivity = {
        id: Date.now().toString(),
        userId: updatedUser.id,
        userName: `${updatedUser.firstName} ${updatedUser.lastName}`,
        action: 'Actualización de perfil',
        module: 'Perfil',
        details: 'Información personal actualizada',
        timestamp: new Date(),
        status: 'success',
        ipAddress: '192.168.1.100'
      };
      
      const currentHistory = JSON.parse(localStorage.getItem('userHistory') || '[]');
      localStorage.setItem('userHistory', JSON.stringify([updateActivity, ...currentHistory]));
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (authState.user) {
        // Log password change activity
        const passwordActivity = {
          id: Date.now().toString(),
          userId: authState.user.id,
          userName: `${authState.user.firstName} ${authState.user.lastName}`,
          action: 'Cambio de contraseña',
          module: 'Seguridad',
          details: 'Contraseña actualizada exitosamente',
          timestamp: new Date(),
          status: 'success',
          ipAddress: '192.168.1.100'
        };
        
        const currentHistory = JSON.parse(localStorage.getItem('userHistory') || '[]');
        localStorage.setItem('userHistory', JSON.stringify([passwordActivity, ...currentHistory]));
      }
    } catch (error) {
      throw new Error('Error al cambiar la contraseña');
    }
  };

  const getAllUsers = (): User[] => {
    return users;
  };

  const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    if (authState.user?.role !== 'admin') {
      throw new Error('Solo los administradores pueden crear usuarios');
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      // Log user creation activity
      const createActivity = {
        id: Date.now().toString(),
        userId: authState.user.id,
        userName: `${authState.user.firstName} ${authState.user.lastName}`,
        action: 'Crear usuario',
        module: 'Usuarios',
        details: `Nuevo usuario creado: ${newUser.firstName} ${newUser.lastName}`,
        timestamp: new Date(),
        status: 'success',
        ipAddress: '192.168.1.100'
      };
      
      const currentHistory = JSON.parse(localStorage.getItem('userHistory') || '[]');
      localStorage.setItem('userHistory', JSON.stringify([createActivity, ...currentHistory]));
    } catch (error) {
      throw new Error('Error al crear el usuario');
    }
  };

  const getUserHistory = () => {
    const storedHistory = localStorage.getItem('userHistory');
    if (storedHistory) {
      return JSON.parse(storedHistory);
    }
    return mockUserHistory;
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      updateUser,
      changePassword,
      getAllUsers,
      createUser,
      getUserHistory,
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
