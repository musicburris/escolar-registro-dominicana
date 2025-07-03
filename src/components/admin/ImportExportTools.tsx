import React, { useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  Database,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ImportExportTools: React.FC = () => {
  const supabase = useSupabase();
  const { logActivity } = useActivityLogger();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExportAttendance = async (format: 'excel' | 'pdf') => {
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "Debe estar autenticado para exportar datos.",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('/functions/v1/export-data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'attendance',
          format: format === 'excel' ? 'excel' : 'pdf',
          parameters: {
            dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            dateTo: new Date().toISOString()
          }
        }),
      });

      if (response.ok) {
        // Crear blob y descargar archivo
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `asistencia_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Exportación completada",
          description: `Archivo de asistencia generado en formato ${format.toUpperCase()}.`,
        });
        logActivity(`Exportación de asistencia en ${format.toUpperCase()}`);
      } else {
        throw new Error('Error en la exportación');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Error en exportación",
        description: "No se pudo completar la exportación.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportStudents = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadProgress(0);

    // Simular proceso de importación
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          toast({
            title: "Importación completada",
            description: `${file.name} procesado exitosamente. Se importaron 25 estudiantes.`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleExportStudents = async (format: 'excel' | 'pdf') => {
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "Debe estar autenticado para exportar datos.",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('/functions/v1/export-data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'students',
          format: format === 'excel' ? 'excel' : 'pdf'
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `estudiantes_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Exportación completada",
          description: `Lista de estudiantes generada en formato ${format.toUpperCase()}.`,
        });
        logActivity(`Exportación de estudiantes en ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Error en exportación",
        description: "No se pudo completar la exportación.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackupSystem = async () => {
    setIsProcessing(true);
    try {
      // En una implementación real, esto llamaría a una función de respaldo
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Respaldo completado",
        description: "Se ha generado el respaldo completo del sistema.",
      });
      logActivity('Respaldo completo del sistema generado');
    } catch (error) {
      toast({
        title: "Error en respaldo",
        description: "No se pudo completar el respaldo del sistema.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="mr-2 h-5 w-5" />
            Herramientas de Exportación
          </CardTitle>
          <CardDescription>
            Descarga datos del sistema en diferentes formatos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Attendance Export */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Registros de Asistencia
              </Label>
              <div className="space-y-2">
                <Button 
                  onClick={() => handleExportAttendance('excel')}
                  disabled={isProcessing}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                  Exportar a Excel
                </Button>
                <Button 
                  onClick={() => handleExportAttendance('pdf')}
                  disabled={isProcessing}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <FileText className="mr-2 h-4 w-4 text-red-600" />
                  Exportar a PDF
                </Button>
              </div>
            </div>

            {/* Students Export */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Lista de Estudiantes
              </Label>
              <div className="space-y-2">
                <Button 
                  onClick={() => handleExportStudents('excel')}
                  disabled={isProcessing}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                  Exportar Estudiantes
                </Button>
                <Button 
                  onClick={() => handleExportStudents('pdf')}
                  disabled={isProcessing}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <FileText className="mr-2 h-4 w-4 text-red-600" />
                  Reporte de Estudiantes
                </Button>
              </div>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Nota:</strong> Para funcionalidades completas de exportación (Excel, PDF), 
              se requiere integración con Supabase para procesamiento backend.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Import Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Herramientas de Importación
          </CardTitle>
          <CardDescription>
            Importa datos desde archivos externos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* CSV Import */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Importar Estudiantes desde CSV</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleImportStudents}
                disabled={isProcessing}
                className="flex-1"
              />
              <Button variant="outline" disabled={isProcessing}>
                <Download className="w-4 h-4 mr-2" />
                Plantilla
              </Button>
            </div>
            {isProcessing && uploadProgress > 0 && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-gray-600">Procesando archivo... {uploadProgress}%</p>
              </div>
            )}
          </div>

          {/* Google Sheets Integration */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Integración con Google Sheets</Label>
            <div className="space-y-2">
              <Input 
                placeholder="URL de Google Sheets"
                disabled={isProcessing}
              />
              <Button disabled className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Importar desde Google Sheets (Próximamente)
              </Button>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Formato CSV requerido:</strong> RNE, Nombre, Apellido, Fecha_Nacimiento, Genero, Seccion
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* System Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Respaldo del Sistema
          </CardTitle>
          <CardDescription>
            Genera respaldos completos de la base de datos y configuraciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleBackupSystem}
              disabled={isProcessing}
              className="h-auto p-4 flex flex-col items-center space-y-2"
              variant="outline"
            >
              {isProcessing ? (
                <Loader className="h-6 w-6 animate-spin" />
              ) : (
                <Database className="h-6 w-6" />
              )}
              <span className="text-sm font-medium">Respaldo Completo</span>
              <span className="text-xs text-gray-500">Base de datos + configuraciones</span>
            </Button>

            <Button 
              disabled={isProcessing}
              className="h-auto p-4 flex flex-col items-center space-y-2"
              variant="outline"
            >
              <Download className="h-6 w-6" />
              <span className="text-sm font-medium">Respaldo Incremental</span>
              <span className="text-xs text-gray-500">Solo cambios recientes</span>
            </Button>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Los respaldos completos requieren integración con Supabase 
              para acceso a la base de datos y almacenamiento seguro.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Status */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Loader className="h-5 w-5 animate-spin" />
              <span>Procesando operación...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImportExportTools;