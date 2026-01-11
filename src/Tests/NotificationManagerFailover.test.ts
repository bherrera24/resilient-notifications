import { NotificationManager } from "../Application/NotificationManager";
import { INotificationProvider } from "../Domain/Interfaces/INotificationProvider";
import { InMemoryRateLimiter } from "../Infrastructure/Services/InMemoryRateLimiter";
import { NotificationType } from "../Domain/Entities/NotificationType";

class FailingProvider implements INotificationProvider {
  async send(): Promise<void> {
    throw new Error("Provider failed");
  }
}

class SuccessfulProvider implements INotificationProvider {
  public sent = false;

  async send(): Promise<void> {
    this.sent = true;
  }
}

describe("NotificationManager Failover", () => {
  it("should fallback to next provider when one fails", async () => {
    const failing = new FailingProvider();
    const success = new SuccessfulProvider();

    const manager = new NotificationManager(
      [failing, success],
      new InMemoryRateLimiter(10, 10)
    );

    await manager.send({
      userId: "user1",
      message: "Test failover",
      type: NotificationType.TRANSACTIONAL,
    });

    expect(success.sent).toBe(true);
  });
});
