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
  descripcionCompetencias: string; // Campo de texto libre para competencias (máximo 1000 caracteres)
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
  recordedBy: string;
  updatedAt: Date;
}

export interface RegistroAnecdotico {
  id: string;
  studentId: string;
  fecha: Date;
  incidencia: string;
  tipoIncidencia: 'positiva' | 'negativa' | 'neutral';
  descripcion: string;
  accionesTomadas?: string;
  registradoPor: string;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  userRole: string;
  accion: string;
  modulo: 'calificaciones' | 'asistencia' | 'estudiantes' | 'usuarios' | 'secciones' | 'reportes';
  detalles: string;
  entidadAfectada?: string;
  entidadId?: string;
  timestamp: Date;
  ipAddress?: string;
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
  registroAnecdotico: RegistroAnecdotico[];
  generatedAt: Date;
  generatedBy: string;
}

export interface IndicadorLogro {
  id: string;
  codigo: string;
  descripcion: string;
  bloqueCompetenciaId: string;
  subjectId: string;
  grado: string;
  createdBy: string;
  createdAt: Date;
}

export interface IndicadorLogroPeriodo {
  id: string;
  indicadorLogroId: string;
  periodo: 'p1' | 'p2' | 'p3' | 'p4';
  sectionId: string;
  subjectId: string;
  trabajado: boolean;
  registradoPor: string;
  fecha: Date;
}

export interface ListaCotejo {
  id: string;
  studentId: string;
  sectionId: string;
  subjectId: string;
  periodo: 'p1' | 'p2' | 'p3' | 'p4';
  indicadoresLogro: {
    indicadorId: string;
    logrado: boolean;
    observaciones?: string;
  }[];
  registradoPor: string;
  updatedAt: Date;
}
