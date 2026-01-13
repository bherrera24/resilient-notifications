import { NotificationManager } from "../Application/NotificationManager";
import { SendGridMockProvider } from "../Infrastructure/Providers/SendGridMockProvider";
import { TwilioMockProvider } from "../Infrastructure/Providers/TwilioMockProvider";
import { InMemoryRateLimiter } from "../Infrastructure/Services/InMemoryRateLimiter";
import { NotificationType } from "../Domain/Entities/NotificationType";
import { InMemoryCache } from "../Infrastructure/Cache/InMemoryCache";
import { InMemoryNotificationQueue } from "../Infrastructure/Queue/InMemoryNotificationQueue";

console.log("[ENV CHECK] RATE_LIMIT_MAX =", process.env.RATE_LIMIT_MAX);
console.log("[ENV CHECK] RATE_LIMIT_WINDOW =", process.env.RATE_LIMIT_WINDOW);
console.log(
  "[ENV CHECK] SENDGRID_FAILURE_RATE =",
  process.env.SENDGRID_FAILURE_RATE
);
console.log("[ENV CHECK] FROM_NETLIFY =", process.env.NETLIFY);

const rateLimitMax = Number(process.env.RATE_LIMIT_MAX ?? 1);
const rateLimitWindow = Number(process.env.RATE_LIMIT_WINDOW ?? 1);

const manager = new NotificationManager(
  [new SendGridMockProvider(), new TwilioMockProvider()],
  new InMemoryRateLimiter(rateLimitMax, rateLimitWindow),
  new InMemoryCache(),
  new InMemoryNotificationQueue()
);

export const handler = async (event: any) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Request body is required" }),
    };
  }
  let data: {
    userId: string;
    message: string;
    type: NotificationType;
  };

  try {
    data = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  if (!data.userId || !data.message || !data.type) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required fields" }),
    };
  }

  await manager.enqueue({
    userId: data.userId,
    message: data.message,
    type: data.type,
  });

  await manager.processQueue();

  return {
    statusCode: 200,
    body: JSON.stringify({ status: "sent" }),
  };
};
