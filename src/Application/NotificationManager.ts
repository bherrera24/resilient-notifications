import { INotificationProvider } from "../Domain/Interfaces/INotificationProvider";
import { IRateLimiter } from "../Domain/Interfaces/IRateLimiter";
import { Notification } from "../Domain/Entities/Notification";
import { ICache } from "../Domain/Interfaces/ICache";
import { INotificationQueue } from "../Domain/Interfaces/INotificationQueue";

export type NotificationProcessResult =
  | { message: string; type: string; status: "sent" }
  | { message: string; type: string; status: "skipped_cache" }
  | { message: string; type: string; status: "rate_limited" }
  | { message: string; type: string; status: "failed"; reason: string };

export class NotificationManager {
  private static readonly CACHE_TTL_SECONDS = 60;
  constructor(
    private readonly providers: INotificationProvider[],
    private readonly rateLimiter: IRateLimiter,
    private readonly cache: ICache,
    private readonly queue: INotificationQueue
  ) {}

  async enqueue(notification: Notification): Promise<void> {
    this.queue.enqueue(notification);
  }

  async processQueue(): Promise<NotificationProcessResult[]> {
    const results: NotificationProcessResult[] = [];

    while (!this.queue.isEmpty()) {
      const notification = this.queue.dequeue();
      if (!notification) continue;

      try {
        if (this.isAlreadySent(notification)) {
          results.push({
            message: notification.message,
            type: String(notification.type),
            status: "skipped_cache",
          });
          continue;
        }

        try {
          this.ensureRateLimit(notification);
        } catch (e: any) {
          if (String(e?.message).includes("Rate limit exceeded")) {
            results.push({
              message: notification.message,
              type: String(notification.type),
              status: "rate_limited",
            });
            continue;
          }
          throw e;
        }

        await this.trySendWithFailover(notification);
        this.markAsSent(notification);

        results.push({
          message: notification.message,
          type: String(notification.type),
          status: "sent",
        });
      } catch (error: any) {
        results.push({
          message: notification.message,
          type: String(notification.type),
          status: "failed",
          reason: String(error?.message ?? "unknown"),
        });
        console.error("Failed to process notification", error);
      }
    }

    return results;
  }

  private getCacheKey(notification: Notification): string {
    return `notification:${notification.userId}:${notification.message}`;
  }

  private markAsSent(notification: Notification): void {
    const cacheKey = this.getCacheKey(notification);
    this.cache.set(cacheKey, true, NotificationManager.CACHE_TTL_SECONDS);
    console.log(
      "[CACHE SET] Stored notification:",
      cacheKey,
      notification.type
    );
  }

  private isAlreadySent(notification: Notification): boolean {
    const cacheKey = this.getCacheKey(notification);
    const cached = this.cache.get<boolean>(cacheKey);

    if (cached) {
      console.log("[CACHE HIT] Notification already sent:", cacheKey);
      return true;
    }

    return false;
  }
  private ensureRateLimit(notification: Notification): void {
    if (!this.rateLimiter.canSend(notification.userId)) {
      throw new Error("Rate limit exceeded");
    }
  }
  private async trySendWithFailover(notification: Notification): Promise<void> {
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

  async send(notification: Notification): Promise<void> {
    if (this.isAlreadySent(notification)) return;

    this.ensureRateLimit(notification);

    await this.trySendWithFailover(notification);

    this.markAsSent(notification);
  }
}
