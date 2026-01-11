import { INotificationProvider } from '../../Domain/Interfaces/INotificationProvider';
import { Notification } from '../../Domain/Entities/Notification';

export class TwilioMockProvider implements INotificationProvider {
  async send(notification: Notification): Promise<void> {
    console.log('Twilio sent:', notification.message);
  }
}
