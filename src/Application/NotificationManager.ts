import { INotificationProvider } from "../Domain/Interfaces/INotificationProvider";
import { IRateLimiter } from "../Domain/Interfaces/IRateLimiter";
import { Notification } from "../Domain/Entities/Notification";

export class NotificationManager {
  constructor(
    private readonly providers: INotificationProvider[],
    private readonly rateLimiter: IRateLimiter
  ) {}

  async send(notification: Notification): Promise<void> {
    if (!this.rateLimiter.canSend(notification.userId)) {
      console.log(`rateLimiter: ${this.rateLimiter}`);
      throw new Error("Rate limit exceeded");
    }

    for (const provider of this.providers) {
      try {
        console.log(`Trying provider: ${provider.constructor.name}`);
        await provider.send(notification);
        console.log(`Success with ${provider.constructor.name}`);
        return;
      } catch (error) {
        console.error(`Failed with ${provider.constructor.name}`);
      }
    }

    throw new Error("All providers failed");
  }
}
