
export interface Evidence {
  id: string;
  studentId: string;
  teacherId: string;
  sectionId: string;
  subjectId: string;
  activityTitle: string;
  activityDescription: string;
  period: 'p1' | 'p2' | 'p3' | 'p4';
  competenceBlock: 'pc1' | 'pc2' | 'pc3' | 'pc4';
  files: EvidenceFile[];
  status: 'completed' | 'not_completed' | 'in_progress';
  dateAssigned: Date;
  dateSubmitted?: Date;
  teacherNotes?: string;
  studentNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EvidenceFile {
  id: string;
  fileName: string;
  fileType: 'image' | 'video' | 'document' | 'audio';
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface EvidenceFolder {
  id: string;
  sectionId: string;
  subjectId: string;
  period: 'p1' | 'p2' | 'p3' | 'p4';
  competenceBlock: 'pc1' | 'pc2' | 'pc3' | 'pc4';
  title: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  evidences: Evidence[];
}

export interface StudentEvidencesSummary {
  studentId: string;
  totalEvidences: number;
  completedActivities: number;
  pendingActivities: number;
  notCompletedActivities: number;
  byPeriod: {
    p1: number;
    p2: number;
    p3: number;
    p4: number;
  };
  recentEvidences: Evidence[];
}
