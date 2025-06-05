
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import RegistroAnecdoticoModal from '@/components/grades/RegistroAnecdoticoModal';
import { toast } from '@/hooks/use-toast';
import { FileText, Search, Filter, Calendar, User, Plus } from 'lucide-react';
import { RegistroAnecdotico } from '@/types/academic';

interface Student {
  id: string;
  name: string;
  rne: string;
  section: string;
  avatar?: string;
}

const ObservationsManagement: React.FC = () => {
  const { user } = useAuth();
  const [selectedSection, setSelectedSection] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [anecdoticoModal, setAnecdoticoModal] = useState<{
    open: boolean;
    studentId: string;
    studentName: string;
    registros: RegistroAnecdotico[];
  }>({ open: false, studentId: '', studentName: '', registros: [] });

  // Mock data
  const sections = [
    { id: '1A', name: '1° A' },
    { id: '1B', name: '1° B' },
    { id: '2A', name: '2° A' },
    { id: '2B', name: '2° B' },
    { id: '3A', name: '3° A' },
    { id: '3B', name: '3° B' }
  ];

  const mockStudents: Student[] = [
    {
      id: 'EST001',
      name: 'Ana María González',
      rne: '20240001',
      section: '1A'
    },
    {
      id: 'EST002',
      name: 'Carlos Rodríguez Pérez',
      rne: '20240002',
      section: '1A'
    },
    {
      id: 'EST003',
      name: 'María José Fernández',
      rne: '20240003',
      section: '1A'
    },
    {
      id: 'EST004',
      name: 'Luis Alberto Martínez',
      rne: '20240004',
      section: '1B'
    }
  ];

  const mockRegistros: RegistroAnecdotico[] = [
    {
      id: '1',
      studentId: 'EST001',
      fecha: new Date('2024-12-01'),
      incidencia: 'Participación destacada en clase',
      tipoIncidencia: 'positiva',
      descripcion: 'Ana demostró un excelente dominio del tema durante la discusión sobre literatura dominicana. Su participación fue muy enriquecedora para toda la clase.',
      accionesTomadas: 'Se felicitó públicamente y se sugirió para representar la clase en el concurso de literatura.',
      registradoPor: 'Prof. María González',
      createdAt: new Date('2024-12-01')
    },
    {
      id: '2',
      studentId: 'EST002',
      fecha: new Date('2024-11-28'),
      incidencia: 'Dificultad con la tarea',
      tipoIncidencia: 'neutral',
      descripcion: 'Carlos no pudo completar la tarea de matemáticas debido a ausencias por enfermedad. Mostró disposición para ponerse al día.',
      accionesTomadas: 'Se le proporcionó material adicional y se programó una tutoría individual.',
      registradoPor: 'Prof. Juan Pérez',
      createdAt: new Date('2024-11-28')
    },
    {
      id: '3',
      studentId: 'EST001',
      fecha: new Date('2024-11-25'),
      incidencia: 'Colaboración excepcional',
      tipoIncidencia: 'positiva',
      descripcion: 'Ana ayudó a sus compañeros durante el trabajo en grupo, demostrando liderazgo y solidaridad.',
      accionesTomadas: 'Se reconoció su comportamiento como ejemplo para otros estudiantes.',
      registradoPor: 'Prof. Carmen López',
      createdAt: new Date('2024-11-25')
    },
    {
      id: '4',
      studentId: 'EST003',
      fecha: new Date('2024-11-20'),
      incidencia: 'Comportamiento disruptivo',
      tipoIncidencia: 'negativa',
      descripcion: 'María interrumpió la clase en varias ocasiones sin levantar la mano, distrayendo a sus compañeros.',
      accionesTomadas: 'Se conversó con la estudiante sobre las normas de convivencia. Se contactó a los padres.',
      registradoPor: 'Prof. Ana Rodríguez',
      createdAt: new Date('2024-11-20')
    }
  ];

  const [registros, setRegistros] = useState<RegistroAnecdotico[]>(mockRegistros);

  const filteredStudents = mockStudents.filter(student => {
    const sectionMatch = !selectedSection || student.section === selectedSection;
    const searchMatch = !searchTerm || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rne.includes(searchTerm);
    return sectionMatch && searchMatch;
  });

  const getStudentRegistros = (studentId: string) => {
    return registros.filter(r => r.studentId === studentId);
  };

  const getFilteredRegistros = () => {
    let filtered = registros;
    
    if (selectedSection) {
      const sectionStudents = mockStudents
        .filter(s => s.section === selectedSection)
        .map(s => s.id);
      filtered = filtered.filter(r => sectionStudents.includes(r.studentId));
    }
    
    if (selectedTipo) {
      filtered = filtered.filter(r => r.tipoIncidencia === selectedTipo);
    }
    
    if (searchTerm) {
      const matchingStudents = mockStudents
        .filter(s => 
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.rne.includes(searchTerm)
        )
        .map(s => s.id);
      filtered = filtered.filter(r => matchingStudents.includes(r.studentId));
    }
    
    return filtered.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  };

  const openRegistroAnecdotico = (student: Student) => {
    const studentRegistros = getStudentRegistros(student.id);
    setAnecdoticoModal({
      open: true,
      studentId: student.id,
      studentName: student.name,
      registros: studentRegistros
    });
  };

  const addRegistroAnecdotico = (nuevoRegistro: Omit<RegistroAnecdotico, 'id' | 'createdAt'>) => {
    const registro: RegistroAnecdotico = {
      ...nuevoRegistro,
      id: Date.now().toString(),
      createdAt: new Date(),
      registradoPor: `${user?.firstName} ${user?.lastName}` || 'Usuario Actual'
    };
    
    setRegistros(prev => [...prev, registro]);
    
    // Actualizar el modal con los nuevos registros
    const updatedRegistros = getStudentRegistros(nuevoRegistro.studentId);
    updatedRegistros.push(registro);
    
    setAnecdoticoModal(prev => ({
      ...prev,
      registros: updatedRegistros
    }));
    
    toast({
      title: "Registro agregado",
      description: "El registro anecdótico ha sido guardado exitosamente",
    });
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'positiva': return 'bg-green-100 text-green-800 border-green-200';
      case 'negativa': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStudentName = (studentId: string) => {
    return mockStudents.find(s => s.id === studentId)?.name || 'Estudiante no encontrado';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-title font-montserrat text-minerd-blue">
            Registro Anecdótico
          </h1>
          <p className="text-body font-opensans text-gray-600">
            Gestión de observaciones e incidencias estudiantiles
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {getFilteredRegistros().length} Registros
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="font-montserrat flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription className="font-opensans">
            Filtra estudiantes y registros por sección, tipo o término de búsqueda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sección</label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las secciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las secciones</SelectItem>
                  {sections.map(section => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Incidencia</label>
              <Select value={selectedTipo} onValueChange={setSelectedTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="positiva">Positiva</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negativa">Negativa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar Estudiante</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nombre o RNE..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle className="font-montserrat flex items-center">
            <User className="mr-2 h-5 w-5" />
            Estudiantes ({filteredStudents.length})
          </CardTitle>
          <CardDescription className="font-opensans">
            Selecciona un estudiante para ver o agregar registros anecdóticos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredStudents.map(student => {
              const studentRegistros = getStudentRegistros(student.id);
              const ultimoRegistro = studentRegistros.sort((a, b) => b.fecha.getTime() - a.fecha.getTime())[0];
              
              return (
                <Card key={student.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback>
                            {student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{student.name}</h3>
                          <p className="text-sm text-gray-600">RNE: {student.rne} • Sección: {student.section}</p>
                          {ultimoRegistro && (
                            <div className="flex items-center mt-1">
                              <Badge className={`text-xs ${getTipoColor(ultimoRegistro.tipoIncidencia)}`}>
                                Último: {ultimoRegistro.tipoIncidencia}
                              </Badge>
                              <span className="text-xs text-gray-500 ml-2">
                                {ultimoRegistro.fecha.toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">
                          {studentRegistros.length} registro{studentRegistros.length !== 1 ? 's' : ''}
                        </Badge>
                        <Button
                          onClick={() => openRegistroAnecdotico(student)}
                          className="bg-minerd-blue hover:bg-blue-700"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Ver Registros
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {filteredStudents.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No se encontraron estudiantes con los filtros aplicados</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Records */}
      <Card>
        <CardHeader>
          <CardTitle className="font-montserrat flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Registros Recientes
          </CardTitle>
          <CardDescription className="font-opensans">
            Últimos registros anecdóticos agregados al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getFilteredRegistros().slice(0, 5).map(registro => (
              <Card key={registro.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-3">
                      <Badge className={getTipoColor(registro.tipoIncidencia)}>
                        {registro.tipoIncidencia.charAt(0).toUpperCase() + registro.tipoIncidencia.slice(1)}
                      </Badge>
                      <h4 className="font-semibold">{registro.incidencia}</h4>
                    </div>
                    <span className="text-sm text-gray-500">
                      {registro.fecha.toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Estudiante:</strong> {getStudentName(registro.studentId)}
                  </p>
                  
                  <p className="text-gray-700 mb-2">{registro.descripcion}</p>
                  
                  {registro.accionesTomadas && (
                    <div className="bg-blue-50 p-2 rounded text-sm">
                      <strong>Acciones:</strong> {registro.accionesTomadas}
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-gray-500">
                    Registrado por: {registro.registradoPor}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {getFilteredRegistros().length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay registros disponibles</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Registro Anecdótico Modal */}
      <RegistroAnecdoticoModal
        open={anecdoticoModal.open}
        onOpenChange={(open) => setAnecdoticoModal(prev => ({ ...prev, open }))}
        studentId={anecdoticoModal.studentId}
        studentName={anecdoticoModal.studentName}
        registros={anecdoticoModal.registros}
        onAddRegistro={addRegistroAnecdotico}
      />
    </div>
  );
};

export default ObservationsManagement;
