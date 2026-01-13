import { Notification } from "../../Domain/Entities/Notification";
import { NotificationType } from "../../Domain/Entities/NotificationType";
import { INotificationQueue } from "../../Domain/Interfaces/INotificationQueue";

export class InMemoryNotificationQueue implements INotificationQueue {
  private transactionalQueue: Notification[] = [];
  private marketingQueue: Notification[] = [];

  enqueue(notification: Notification): void {
    if (notification.type === NotificationType.TRANSACTIONAL) {
      this.transactionalQueue.push(notification);
    } else {
      this.marketingQueue.push(notification);
    }
  }

  dequeue(): Notification | undefined {
    if (this.transactionalQueue.length > 0) {
      return this.transactionalQueue.shift();
    }

    return this.marketingQueue.shift();
  }

  isEmpty(): boolean {
    return (
      this.transactionalQueue.length === 0 && this.marketingQueue.length === 0
    );
  }
}
