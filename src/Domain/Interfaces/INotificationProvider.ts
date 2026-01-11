import { Notification } from '../Entities/Notification';

export interface INotificationProvider {
  send(notification: Notification): Promise<void>;
}
