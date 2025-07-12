
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2, School } from 'lucide-react';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: "Bienvenido",
          description: "Has iniciado sesión correctamente",
        });
      } else {
        toast({
          title: "Error de autenticación",
          description: "Email o contraseña incorrectos",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al iniciar sesión",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestCredentials = (role: string) => {
    const credentials = {
      admin: { email: 'director@ejemplo.edu.do', password: 'demo123' },
      teacher: { email: 'profesor@ejemplo.edu.do', password: 'demo123' },
      auxiliary: { email: 'auxiliar@ejemplo.edu.do', password: 'demo123' },
      parent: { email: 'padre@ejemplo.com', password: 'demo123' },
      student: { email: '202300001', password: 'demo123' }
    };
    
    const cred = credentials[role as keyof typeof credentials];
    setEmail(cred.email);
    setPassword(cred.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo y título */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <School className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sistema Escolar
          </h1>
          <p className="text-gray-600 mt-2">
            Registro Escolar 1er Ciclo Secundaria
          </p>
        </div>

        {/* Formulario de login */}
        <Card>
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Usuario / Email</Label>
                <Input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com o RNE"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>

            {/* Botones de prueba */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 mb-3 text-center">
                Usuarios de demostración:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fillTestCredentials('admin')}
                  disabled={isLoading}
                >
                  Director
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fillTestCredentials('teacher')}
                  disabled={isLoading}
                >
                  Profesor
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fillTestCredentials('auxiliary')}
                  disabled={isLoading}
                >
                  Auxiliar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fillTestCredentials('parent')}
                  disabled={isLoading}
                >
                  Padre/Tutor
                </Button>
              </div>
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fillTestCredentials('student')}
                  disabled={isLoading}
                  className="w-full"
                >
                  Estudiante (RNE: 202300001)
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Contraseña para todos: demo123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
