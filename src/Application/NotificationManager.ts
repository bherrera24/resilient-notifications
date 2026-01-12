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
      throw new Error("Rate limit exceeded");
    }
    console.log("[ENV]", {
      RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
      RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW,
      SENDGRID_FAILURE_RATE: process.env.SENDGRID_FAILURE_RATE,
    });

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
