
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

export interface Competencia {
  id: string;
  codigo: string;
  descripcion: string;
  bloqueId: string;
}

export interface BloqueCompetencias {
  id: string;
  nombre: string;
  codigo: string; // PC1, PC2, PC3, PC4
  competencias: Competencia[];
  subjectId: string;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  sectionId: string;
  // Períodos por bloque (P1, P2, P3, P4)
  pc1: {
    p1?: number;
    p2?: number;
    p3?: number;
    p4?: number;
    rp1?: number;
    rp2?: number;
    rp3?: number;
    rp4?: number;
  };
  pc2: {
    p1?: number;
    p2?: number;
    p3?: number;
    p4?: number;
    rp1?: number;
    rp2?: number;
    rp3?: number;
    rp4?: number;
  };
  pc3: {
    p1?: number;
    p2?: number;
    p3?: number;
    p4?: number;
    rp1?: number;
    rp2?: number;
    rp3?: number;
    rp4?: number;
  };
  pc4: {
    p1?: number;
    p2?: number;
    p3?: number;
    p4?: number;
    rp1?: number;
    rp2?: number;
    rp3?: number;
    rp4?: number;
  };
  // Promedios de cada bloque
  promedioPC1: number;
  promedioPC2: number;
  promedioPC3: number;
  promedioPC4: number;
  // Calificación final
  calificacionFinal: number;
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
