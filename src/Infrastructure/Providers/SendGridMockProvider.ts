import { INotificationProvider } from '../../Domain/Interfaces/INotificationProvider';
import { Notification } from '../../Domain/Entities/Notification';

export class SendGridMockProvider implements INotificationProvider {
  async send(notification: Notification): Promise<void> {
    if (Math.random() < 0.5) {
      throw new Error('SendGrid failed');
    }
    console.log('SendGrid sent:', notification.message);
  }
}
