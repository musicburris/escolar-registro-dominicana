
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { FileText, Download, Mail, Eye, Archive, Filter, Search } from 'lucide-react';
import ReportConfigModal from './ReportConfigModal';

interface StudentReport {
  id: string;
  name: string;
  rne: string;
  section: string;
  avatar?: string;
  grades: {
    subject: string;
    p1: number;
    p2: number;
    p3: number;
    p4: number;
    rp1?: number;
    rp2?: number;
    rp3?: number;
    rp4?: number;
    average: number;
  }[];
  attendance: {
    totalAbsences: number;
    totalLateArrivals: number;
  };
  observations: string;
}

interface SectionInfo {
  id: string;
  name: string;
  coordinatorName: string;
}

interface ReportConfig {
  institutionName: string;
  institutionSubtitle: string;
  academicYear: string;
  centerName: string;
  logoUrl?: string;
  footerText: string;
  directorName: string;
  directorTitle: string;
}

const ReportsManagement: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [students, setStudents] = useState<StudentReport[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Configuración de boletas
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    institutionName: 'MINISTERIO DE EDUCACIÓN',
    institutionSubtitle: 'REGISTRO ESCOLAR 1ER CICLO SECUNDARIA',
    academicYear: '2024-2025',
    centerName: 'Centro Educativo Demo',
    footerText: 'Generado automáticamente por Registro Escolar 1er Ciclo Secundaria – RD',
    directorName: 'Director(a)',
    directorTitle: 'Director(a) del Centro'
  });

  // Mock data with coordinator teachers
  const sections: SectionInfo[] = [
    { id: '1A', name: '1° A', coordinatorName: 'Prof. María González' },
    { id: '1B', name: '1° B', coordinatorName: 'Prof. Carmen López' },
    { id: '2A', name: '2° A', coordinatorName: 'Prof. Luis Méndez' },
    { id: '2B', name: '2° B', coordinatorName: 'Prof. Ana Martínez' },
    { id: '3A', name: '3° A', coordinatorName: 'Prof. Juan Pérez' },
    { id: '3B', name: '3° B', coordinatorName: 'Prof. Rosa Fernández' }
  ];

  const periods = [
    { id: 'Q1', name: 'Primer Trimestre (Q1)' },
    { id: 'Q2', name: 'Segundo Trimestre (Q2)' },
    { id: 'Q3', name: 'Tercer Trimestre (Q3)' },
    { id: 'Q4', name: 'Cuarto Trimestre (Q4)' },
    { id: 'FINAL', name: 'Boleta Final' }
  ];

  const mockStudents: StudentReport[] = [
    {
      id: '1',
      name: 'Ana María González',
      rne: '20240001',
      section: '1° A',
      grades: [
        { subject: 'Lengua Española', p1: 85, p2: 78, p3: 92, p4: 88, rp2: 82, average: 86.75 },
        { subject: 'Matemática', p1: 80, p2: 75, p3: 88, p4: 85, average: 82.0 },
        { subject: 'Ciencias Sociales', p1: 90, p2: 88, p3: 95, p4: 92, average: 91.25 },
        { subject: 'Ciencias de la Naturaleza', p1: 87, p2: 82, p3: 90, p4: 85, average: 86.0 }
      ],
      attendance: {
        totalAbsences: 2,
        totalLateArrivals: 1
      },
      observations: 'Excelente estudiante con participación activa en clase. Demuestra liderazgo natural.'
    },
    {
      id: '2',
      name: 'Carlos Rodríguez Pérez',
      rne: '20240002',
      section: '1° A',
      grades: [
        { subject: 'Lengua Española', p1: 72, p2: 68, p3: 75, p4: 70, rp2: 75, average: 72.5 },
        { subject: 'Matemática', p1: 78, p2: 72, p3: 80, p4: 75, average: 76.25 },
        { subject: 'Ciencias Sociales', p1: 75, p2: 70, p3: 78, p4: 72, average: 73.75 },
        { subject: 'Ciencias de la Naturaleza', p1: 70, p2: 68, p3: 75, p4: 72, average: 71.25 }
      ],
      attendance: {
        totalAbsences: 5,
        totalLateArrivals: 3
      },
      observations: 'Necesita refuerzo en comprensión lectora. Se recomienda apoyo adicional en casa.'
    }
  ];

  const loadStudents = () => {
    if (selectedSection && selectedPeriod) {
      setStudents(mockStudents);
      toast({
        title: "Estudiantes cargados",
        description: `Datos de ${sections.find(s => s.id === selectedSection)?.name} - ${periods.find(p => p.id === selectedPeriod)?.name}`,
      });
    }
  };

  const generateIndividualReport = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      toast({
        title: "Boleta generada",
        description: `Boleta PDF generada para ${student.name}`,
      });
      // Aquí iría la lógica para generar el PDF con la configuración personalizada
    }
  };

  const generateGroupReport = () => {
    if (students.length > 0) {
      toast({
        title: "Boletas grupales generadas",
        description: `ZIP con ${students.length} boletas generado para descarga`,
      });
      // Aquí iría la lógica para generar el ZIP con todas las boletas
    }
  };

  const sendReportByEmail = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      toast({
        title: "Boleta enviada",
        description: `Boleta enviada por correo al representante de ${student.name}`,
      });
    }
  };

  const previewReport = (studentId: string) => {
    setSelectedStudent(studentId);
    setPreviewOpen(true);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rne.includes(searchTerm)
  );

  const selectedStudentData = students.find(s => s.id === selectedStudent);
  const selectedSectionInfo = sections.find(s => s.id === selectedSection);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-title font-montserrat text-minerd-blue">
            Boletas y Reportes
          </h1>
          <p className="text-body font-opensans text-gray-600">
            Generación de boletas trimestrales y reportes académicos
          </p>
        </div>
        <ReportConfigModal 
          config={reportConfig}
          onConfigChange={setReportConfig}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="font-montserrat flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros de Generación
          </CardTitle>
          <CardDescription className="font-opensans">
            Selecciona la sección y período para generar las boletas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sección</label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sección" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map(section => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map(period => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={loadStudents}
                disabled={!selectedSection || !selectedPeriod}
                className="w-full bg-minerd-blue hover:bg-blue-700"
              >
                Cargar Estudiantes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      {students.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="font-montserrat">
                  Lista de Estudiantes
                </CardTitle>
                <CardDescription className="font-opensans">
                  {sections.find(s => s.id === selectedSection)?.name} • {periods.find(p => p.id === selectedPeriod)?.name}
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={generateGroupReport}
                  className="bg-minerd-green hover:bg-green-700 flex items-center"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Generar ZIP
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre o RNE..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Estudiante</th>
                    <th className="text-center p-3">Promedio General</th>
                    <th className="text-center p-3">Asistencia</th>
                    <th className="text-center p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => {
                    const generalAverage = student.grades.reduce((sum, grade) => sum + grade.average, 0) / student.grades.length;
                    
                    return (
                      <tr key={student.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="p-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={student.avatar} />
                              <AvatarFallback>
                                {student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-gray-500">RNE: {student.rne}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <Badge 
                            variant={generalAverage >= 85 ? "default" : generalAverage >= 70 ? "secondary" : "destructive"}
                            className="font-bold"
                          >
                            {generalAverage.toFixed(1)}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          <div className="text-sm">
                            <div>Faltas: {student.attendance.totalAbsences}</div>
                            <div>Tardanzas: {student.attendance.totalLateArrivals}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => previewReport(student.id)}
                              className="h-8 w-8 p-0"
                              title="Vista previa"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => generateIndividualReport(student.id)}
                              className="h-8 w-8 p-0"
                              title="Descargar PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => sendReportByEmail(student.id)}
                              className="h-8 w-8 p-0"
                              title="Enviar por correo"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vista Previa de Boleta</DialogTitle>
            <DialogDescription>
              Boleta de {selectedStudentData?.name} - {periods.find(p => p.id === selectedPeriod)?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudentData && selectedSectionInfo && (
            <div className="bg-white p-6 border rounded-lg">
              {/* Header with custom configuration */}
              <div className="text-center mb-6 border-b pb-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="w-16 h-16 bg-minerd-blue rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">RD</span>
                  </div>
                  <div className="text-center flex-1">
                    <h2 className="text-xl font-bold text-minerd-blue">{reportConfig.institutionName}</h2>
                    <h3 className="text-lg font-semibold">{reportConfig.institutionSubtitle}</h3>
                    <p className="text-sm">{reportConfig.centerName} • Año Escolar {reportConfig.academicYear}</p>
                  </div>
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    {reportConfig.logoUrl ? (
                      <img src={reportConfig.logoUrl} alt="Logo" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-500">Logo Centro</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Student Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p><strong>Nombre:</strong> {selectedStudentData.name}</p>
                  <p><strong>RNE:</strong> {selectedStudentData.rne}</p>
                  <p><strong>Docente Coordinador:</strong> {selectedSectionInfo.coordinatorName}</p>
                </div>
                <div>
                  <p><strong>Sección:</strong> {selectedStudentData.section}</p>
                  <p><strong>Período:</strong> {periods.find(p => p.id === selectedPeriod)?.name}</p>
                </div>
              </div>

              {/* Grades Table */}
              <div className="mb-6">
                <h4 className="font-bold mb-3">CALIFICACIONES POR ASIGNATURA</h4>
                <table className="w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-left">Asignatura</th>
                      <th className="border border-gray-300 p-2 text-center">P1</th>
                      <th className="border border-gray-300 p-2 text-center">P2</th>
                      <th className="border border-gray-300 p-2 text-center">P3</th>
                      <th className="border border-gray-300 p-2 text-center">P4</th>
                      <th className="border border-gray-300 p-2 text-center">Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudentData.grades.map((grade, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-2">{grade.subject}</td>
                        <td className="border border-gray-300 p-2 text-center">{grade.p1}</td>
                        <td className="border border-gray-300 p-2 text-center">{grade.p2}</td>
                        <td className="border border-gray-300 p-2 text-center">{grade.p3}</td>
                        <td className="border border-gray-300 p-2 text-center">{grade.p4}</td>
                        <td className="border border-gray-300 p-2 text-center font-bold">{grade.average}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Attendance */}
              <div className="mb-6">
                <h4 className="font-bold mb-3">REGISTRO DE ASISTENCIA</h4>
                <div className="grid grid-cols-2 gap-4">
                  <p><strong>Total de Faltas:</strong> {selectedStudentData.attendance.totalAbsences}</p>
                  <p><strong>Total de Tardanzas:</strong> {selectedStudentData.attendance.totalLateArrivals}</p>
                </div>
              </div>

              {/* Observations */}
              <div className="mb-6">
                <h4 className="font-bold mb-3">OBSERVACIONES GENERALES</h4>
                <p className="text-sm">{selectedStudentData.observations}</p>
              </div>

              {/* Signatures with custom director name */}
              <div className="flex justify-between mt-8 pt-4 border-t">
                <div className="text-center">
                  <div className="w-32 h-16 border-b border-gray-400 mb-2"></div>
                  <p className="text-sm">{reportConfig.directorName}</p>
                  <p className="text-xs text-gray-600">{reportConfig.directorTitle}</p>
                </div>
                <div className="text-center">
                  <div className="w-32 h-16 border border-gray-400 mb-2"></div>
                  <p className="text-sm">{selectedSectionInfo.coordinatorName}</p>
                  <p className="text-xs text-gray-600">Docente Coordinador</p>
                </div>
                <div className="text-center">
                  <div className="w-32 h-16 border border-gray-400 mb-2"></div>
                  <p className="text-sm">Sello Institucional</p>
                </div>
              </div>

              {/* Footer with custom text */}
              <div className="text-center mt-6 text-xs text-gray-500">
                {reportConfig.footerText}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsManagement;
