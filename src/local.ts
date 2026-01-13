import { NotificationManager } from "./Application/NotificationManager";
import { SendGridMockProvider } from "./Infrastructure/Providers/SendGridMockProvider";
import { TwilioMockProvider } from "./Infrastructure/Providers/TwilioMockProvider";
import { InMemoryRateLimiter } from "./Infrastructure/Services/InMemoryRateLimiter";
import { InMemoryCache } from "./Infrastructure/Cache/InMemoryCache";
import { InMemoryNotificationQueue } from "./Infrastructure/Queue/InMemoryNotificationQueue";
import { NotificationType } from "./Domain/Entities/NotificationType";

const manager = new NotificationManager(
  [new SendGridMockProvider(), new TwilioMockProvider()],
  new InMemoryRateLimiter(5, 60),
  new InMemoryCache(),
  new InMemoryNotificationQueue()
);

(async () => {
  console.log("=== First run ===");
  await manager.enqueue({
    userId: "user1",
    message: "Promo 20%",
    type: NotificationType.MARKETING,
  });
  await manager.enqueue({
    userId: "user1",
    message: "Order confirmed",
    type: NotificationType.TRANSACTIONAL,
  });

  await manager.processQueue();

  console.log("\n=== Second run (should hit cache) ===");
  await manager.enqueue({
    userId: "user1",
    message: "Promo 20%",
    type: NotificationType.MARKETING,
  });
  await manager.enqueue({
    userId: "user1",
    message: "Order confirmed",
    type: NotificationType.TRANSACTIONAL,
  });

  await manager.processQueue();
})();
