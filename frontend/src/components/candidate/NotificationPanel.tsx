
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';

interface Notification {
  id: number;
  titre: string;
  message: string;
  type: string;
  statut: 'lu' | 'non_lu';
  created_at: string;
}

interface NotificationPanelProps {
  nupcan: string;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ nupcan }) => {
  const queryClient = useQueryClient();

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', nupcan],
    queryFn: () => apiService.getCandidateNotifications(nupcan),
    refetchInterval: 30000, // Actualiser toutes les 30 secondes
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => 
      apiService.markNotificationAsRead(notificationId.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', nupcan] });
    },
  });

  const notifications: Notification[] = (notificationsData?.success && notificationsData?.data) ? notificationsData.data as Notification[] : [];
  const unreadCount = notifications.filter((n: Notification) => n.statut === 'non_lu').length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'document_validation':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'document_rejection':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notifications
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucune notification</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification: Notification) => (
              <div 
                key={notification.id}
                className={`p-4 border rounded-lg ${
                  notification.statut === 'non_lu' 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{notification.titre}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  {notification.statut === 'non_lu' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={markAsReadMutation.isPending}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {notifications.length > 5 && (
              <div className="text-center pt-2">
                <Button variant="outline" size="sm">
                  Voir toutes les notifications ({notifications.length})
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationPanel;
