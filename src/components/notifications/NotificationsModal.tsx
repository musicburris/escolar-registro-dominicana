
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Bell, CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  read: boolean;
}

interface NotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ open, onOpenChange }) => {
  // Mock notifications data with state
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Calificaciones Pendientes',
      message: 'Tienes 5 estudiantes sin calificar en Matemática - 2° A',
      type: 'warning',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
      read: false
    },
    {
      id: '2',
      title: 'Respaldo Completado',
      message: 'El respaldo automático del sistema se completó exitosamente',
      type: 'success',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false
    },
    {
      id: '3',
      title: 'Nuevo Estudiante Registrado',
      message: 'María José Fernández ha sido registrada en 1° B',
      type: 'info',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true
    }
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error': return <X className="w-5 h-5 text-red-600" />;
      default: return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'success': return 'default';
      case 'warning': return 'destructive';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)} día(s)`;
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({
      ...notification,
      read: true
    })));
    
    toast({
      title: "Notificaciones marcadas",
      description: "Todas las notificaciones han sido marcadas como leídas",
    });
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    ));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    
    toast({
      title: "Notificación eliminada",
      description: "La notificación ha sido eliminada",
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notificaciones
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            Revisa las últimas actualizaciones del sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay notificaciones</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card key={notification.id} className={`${notification.read ? 'opacity-60' : 'border-l-4 border-l-blue-500'}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm">{notification.title}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getBadgeVariant(notification.type)} className="text-xs">
                              {notification.type}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-400">{formatTimeAgo(notification.timestamp)}</p>
                          {!notification.read && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs h-6"
                            >
                              Marcar como leída
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-2"></div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          {unreadCount > 0 && (
            <Button 
              onClick={markAllAsRead}
              className="bg-minerd-blue hover:bg-blue-700"
            >
              Marcar Todas como Leídas ({unreadCount})
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsModal;
