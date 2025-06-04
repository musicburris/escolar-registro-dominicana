
export interface SchoolCenter {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  director: string;
  schoolYear: {
    start: Date;
    end: Date;
  };
  logo?: string;
}

export interface Section {
  id: string;
  grade: 1 | 2 | 3;
  name: string; // A, B, C, etc.
  coordinatorTeacherId: string;
  coordinatorName: string;
  studentCount: number;
  subjects: string[];
}

export interface Student {
  id: string;
  rne: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: 'M' | 'F';
  sectionId: string;
  address: string;
  emergencyPhone: string;
  parentName: string;
  parentPhone: string;
  avatar?: string;
  isActive: boolean;
}

export interface Subject {
  id: string;
  name: string;
  competencies: {
    block1: string;
    block2: string;
    block3: string;
    block4: string;
  };
  blockWeights: {
    block1: number;
    block2: number;
    block3: number;
    block4: number;
  };
}
