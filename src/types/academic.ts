
export interface Attendance {
  id: string;
  studentId: string;
  sectionId: string;
  date: Date;
  isPresent: boolean;
  isLate: boolean;
  reason?: string;
  recordedBy: string;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  sectionId: string;
  // Regular periods
  p1?: number;
  p2?: number;
  p3?: number;
  p4?: number;
  // Recovery periods
  rp1?: number;
  rp2?: number;
  rp3?: number;
  rp4?: number;
  // Calculated averages
  blockAverage: number;
  finalAverage: number;
  observations?: string;
  recordedBy: string;
  updatedAt: Date;
}

export interface ReportCard {
  id: string;
  studentId: string;
  sectionId: string;
  period: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'FINAL';
  grades: Grade[];
  attendance: {
    totalAbsences: number;
    totalLateArrivals: number;
  };
  generalObservations: string;
  generatedAt: Date;
  generatedBy: string;
}
