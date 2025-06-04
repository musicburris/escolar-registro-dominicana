
export interface Student {
  id: string;
  rne: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'masculino' | 'femenino';
  sectionId: string;
  address: string;
  emergencyPhone: string;
  representativeName: string;
  representativePhone: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Section {
  id: string;
  grade: number;
  name: string;
  coordinatorId: string;
  academicYear: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  isRequired: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
