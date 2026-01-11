import { NotificationManager } from './Application/NotificationManager';
import { SendGridMockProvider } from './Infrastructure/Providers/SendGridMockProvider';
import { TwilioMockProvider } from './Infrastructure/Providers/TwilioMockProvider';
import { InMemoryRateLimiter } from './Infrastructure/Services/InMemoryRateLimiter';
import { NotificationType } from './Domain/Entities/NotificationType';

const manager = new NotificationManager(
  [new SendGridMockProvider(), new TwilioMockProvider()],
  new InMemoryRateLimiter(2, 10)
);

(async () => {
  await manager.send({
    userId: 'user1',
    message: 'Test local',
    type: NotificationType.TRANSACTIONAL
  });
})();
