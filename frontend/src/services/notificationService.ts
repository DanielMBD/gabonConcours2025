
import { toast } from '@/hooks/use-toast';

interface NotificationData {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  userId?: string;
  metadata?: any;
}

class NotificationService {
  private notifications: NotificationData[] = [];

  // Envoyer une notification toast
  showToast(notification: NotificationData) {
    const variants = {
      success: 'default' as const,
      error: 'destructive' as const,
      warning: 'default' as const,
      info: 'default' as const,
    };

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };

    toast({
      title: `${icons[notification.type]} ${notification.title}`,
      description: notification.message,
      variant: variants[notification.type],
    });
  }

  // Notifications système pour les candidatures
  notifyApplicationSubmitted(candidateName: string, nupcan: string) {
    this.showToast({
      title: 'Candidature soumise !',
      message: `Bonjour ${candidateName}, votre candidature ${nupcan} a été soumise avec succès.`,
      type: 'success'
    });
  }

  notifyDocumentValidated(documentType: string) {
    this.showToast({
      title: 'Document validé',
      message: `Votre document "${documentType}" a été validé par nos équipes.`,
      type: 'success'
    });
  }

  notifyDocumentRejected(documentType: string, reason?: string) {
    this.showToast({
      title: 'Document rejeté',
      message: `Votre document "${documentType}" a été rejeté. ${reason ? `Raison: ${reason}` : 'Veuillez le corriger et le soumettre à nouveau.'}`,
      type: 'error'
    });
  }

  notifyPaymentSuccess(amount: number, method: string) {
    this.showToast({
      title: 'Paiement réussi !',
      message: `Votre paiement de ${amount.toLocaleString()} FCFA via ${method} a été traité avec succès.`,
      type: 'success'
    });
  }

  notifyPaymentFailure(reason?: string) {
    this.showToast({
      title: 'Échec du paiement',
      message: reason || 'Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer.',
      type: 'error'
    });
  }

  notifyApplicationComplete(nupcan: string) {
    this.showToast({
      title: '🎉 Candidature complétée !',
      message: `Félicitations ! Votre candidature ${nupcan} est maintenant complète. Vous recevrez un email de confirmation.`,
      type: 'success'
    });
  }

  notifyExamDateScheduled(date: string, location: string) {
    this.showToast({
      title: 'Date d\'examen confirmée',
      message: `Votre examen est programmé le ${date} à ${location}. Préparez-vous bien !`,
      type: 'info'
    });
  }

  notifyDeadlineReminder(daysLeft: number, deadlineType: string) {
    const urgency = daysLeft <= 3 ? 'error' : daysLeft <= 7 ? 'warning' : 'info';
    
    this.showToast({
      title: `Rappel de délai`,
      message: `Plus que ${daysLeft} jour(s) pour ${deadlineType}. Ne tardez pas !`,
      type: urgency
    });
  }

  // Notifications par email (simulation)
  async sendEmailNotification(email: string, subject: string, content: string): Promise<boolean> {
    try {
      console.log(`Envoi email à ${email}:`);
      console.log(`Sujet: ${subject}`);
      console.log(`Contenu: ${content}`);
      
      // Simulation d'envoi d'email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.showToast({
        title: 'Email envoyé',
        message: `Un email de notification a été envoyé à ${email}`,
        type: 'success'
      });
      
      return true;
    } catch (error) {
      console.error('Erreur envoi email:', error);
      this.showToast({
        title: 'Erreur email',
        message: 'Impossible d\'envoyer l\'email de notification',
        type: 'error'
      });
      return false;
    }
  }

  // Notifications push (simulation pour PWA future)
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Ce navigateur ne supporte pas les notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  async sendPushNotification(title: string, message: string, icon?: string) {
    if (await this.requestNotificationPermission()) {
      new Notification(title, {
        body: message,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'gabconcours-notification',
        requireInteraction: true,
      });
    }
  }

  // Historique des notifications
  addToHistory(notification: NotificationData) {
    this.notifications.unshift({
      ...notification,
      metadata: {
        ...notification.metadata,
        timestamp: new Date().toISOString()
      }
    });
    
    // Garder seulement les 50 dernières notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
  }

  getNotificationHistory(): NotificationData[] {
    return this.notifications;
  }

  clearHistory() {
    this.notifications = [];
  }

  // Notifications automatiques basées sur les actions utilisateur
  handleUserAction(action: string, data: any) {
    switch (action) {
      case 'candidature_submitted':
        this.notifyApplicationSubmitted(data.candidateName, data.nupcan);
        this.addToHistory({
          title: 'Candidature soumise',
          message: `Candidature ${data.nupcan} soumise`,
          type: 'success',
          userId: data.userId,
          metadata: data
        });
        break;

      case 'document_uploaded':
        this.showToast({
          title: 'Document téléchargé',
          message: `Document "${data.documentType}" téléchargé avec succès`,
          type: 'success'
        });
        break;

      case 'payment_initiated':
        this.showToast({
          title: 'Paiement initié',
          message: 'Votre paiement est en cours de traitement...',
          type: 'info'
        });
        break;

      case 'session_created':
        this.showToast({
          title: 'Session créée',
          message: 'Votre session a été créée. Vous pouvez maintenant continuer votre candidature.',
          type: 'success'
        });
        break;

      default:
        console.log(`Action non reconnue: ${action}`);
    }
  }
}

export const notificationService = new NotificationService();
