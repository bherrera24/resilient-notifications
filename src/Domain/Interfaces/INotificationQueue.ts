import { Notification } from "../Entities/Notification";

export interface INotificationQueue {
  enqueue(notification: Notification): void;
  dequeue(): Notification | undefined;
  isEmpty(): boolean;
}
