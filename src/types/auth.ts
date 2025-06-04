
export type UserRole = 'admin' | 'teacher' | 'auxiliary' | 'parent' | 'student';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  assignedSections?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  identifier: string; // Email or RNE
  password: string;
}
