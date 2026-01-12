import { NotificationManager } from "./Application/NotificationManager";
import { SendGridMockProvider } from "./Infrastructure/Providers/SendGridMockProvider";
import { TwilioMockProvider } from "./Infrastructure/Providers/TwilioMockProvider";
import { InMemoryRateLimiter } from "./Infrastructure/Services/InMemoryRateLimiter";
import { NotificationType } from "./Domain/Entities/NotificationType";
import { InMemoryCache } from "./Infrastructure/Cache/InMemoryCache";

const manager = new NotificationManager(
  [new SendGridMockProvider(), new TwilioMockProvider()],
  new InMemoryRateLimiter(2, 10),
  new InMemoryCache()
);

// (async () => {
//   await manager.send({
//     userId: "user1",
//     message: "Test local",
//     type: NotificationType.TRANSACTIONAL,
//   });
// })();
(async () => {
  const notification = {
    userId: "user1",
    message: "Test local",
    type: NotificationType.TRANSACTIONAL,
  };

  console.log("---- FIRST SEND ----");
  await manager.send(notification);

  console.log("---- SECOND SEND ----");
  await manager.send(notification);
})();
