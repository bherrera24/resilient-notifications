import { NotificationManager } from "../Application/NotificationManager";
import { SendGridMockProvider } from "../Infrastructure/Providers/SendGridMockProvider";
import { TwilioMockProvider } from "../Infrastructure/Providers/TwilioMockProvider";
import { InMemoryRateLimiter } from "../Infrastructure/Services/InMemoryRateLimiter";
import { NotificationType } from "../Domain/Entities/NotificationType";

const rateLimitMax = Number(process.env.RATE_LIMIT_MAX ?? 2);
const rateLimitWindow = Number(process.env.RATE_LIMIT_WINDOW ?? 10);
const manager = new NotificationManager(
  [new SendGridMockProvider(), new TwilioMockProvider()],
  new InMemoryRateLimiter(rateLimitMax, rateLimitWindow)
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
    body: JSON.stringify({ status: "sent" }),
  };
};
