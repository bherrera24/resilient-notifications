import { NotificationManager } from '../Application/NotificationManager';
import { SendGridMockProvider } from '../Infrastructure/Providers/SendGridMockProvider';
import { TwilioMockProvider } from '../Infrastructure/Providers/TwilioMockProvider';
import { InMemoryRateLimiter } from '../Infrastructure/Services/InMemoryRateLimiter';
import { NotificationType } from '../Domain/Entities/NotificationType';

const manager = new NotificationManager(
  [new SendGridMockProvider(), new TwilioMockProvider()],
  new InMemoryRateLimiter(2, 10)
);

export const handler = async (event: any) => {
  const body = JSON.parse(event.body);

  await manager.send({
    userId: body.userId,
    message: body.message,
    type: body.type as NotificationType,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ status: 'sent' }),
  };
};
