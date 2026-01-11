import { NotificationType } from './NotificationType';

export interface Notification {
  userId: string;
  message: string;
  type: NotificationType;
}
