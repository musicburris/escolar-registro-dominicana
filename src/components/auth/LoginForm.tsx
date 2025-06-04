
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LoginForm: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login({ identifier, password });
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al Sistema de Registro Escolar",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de inicio de sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    { label: 'Administrador', id: 'director@ejemplo.edu.do', role: 'Director/a' },
    { label: 'Docente', id: 'profesor@ejemplo.edu.do', role: 'Coordinador/a' },
    { label: 'Auxiliar', id: 'auxiliar@ejemplo.edu.do', role: 'Administrativo/a' },
    { label: 'Padre/Tutor', id: 'padre@ejemplo.com', role: 'Representante' },
    { label: 'Estudiante', id: '202300001', role: 'RNE' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-minerd-blue via-blue-700 to-minerd-green flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <BookOpen className="w-8 h-8 text-minerd-blue" />
          </div>
          <div>
            <h1 className="font-montserrat font-bold text-2xl text-white">
              Registro Escolar
            </h1>
            <p className="text-blue-100 font-opensans">
              1er Ciclo Secundaria - República Dominicana
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-montserrat font-bold text-center text-minerd-blue">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-center font-opensans">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="identifier" className="font-opensans font-medium">
                  Usuario (Correo o RNE)
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="ejemplo@correo.com o RNE"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-10 font-opensans"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-opensans font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 font-opensans"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-minerd-green hover:bg-green-700 font-opensans font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  'Ingresar'
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-minerd-blue hover:underline font-opensans"
                >
                  ¿Olvidé mi contraseña?
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="shadow-lg border-0 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-montserrat font-semibold text-minerd-blue">
              Credenciales de Demostración
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {demoCredentials.map((cred, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 rounded bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setIdentifier(cred.id);
                    setPassword('demo123');
                  }}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {cred.label}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cred.role}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 font-mono">
                      {cred.id}
                    </p>
                    <p className="text-xs text-gray-400">
                      demo123
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Haz clic en cualquier credencial para usarla
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-blue-100 text-sm font-opensans">
          <p>MINERD - Ministerio de Educación</p>
          <p>República Dominicana © 2024</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
