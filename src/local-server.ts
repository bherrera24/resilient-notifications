import "dotenv/config";
import express from "express";

import { NotificationManager } from "./Application/NotificationManager";
import { SendGridMockProvider } from "./Infrastructure/Providers/SendGridMockProvider";
import { TwilioMockProvider } from "./Infrastructure/Providers/TwilioMockProvider";
import { InMemoryRateLimiter } from "./Infrastructure/RateLimiter/InMemoryRateLimiter";
import { InMemoryCache } from "./Infrastructure/Cache/InMemoryCache";
import { InMemoryNotificationQueue } from "./Infrastructure/Queue/InMemoryNotificationQueue";
import { NotificationType } from "./Domain/Entities/NotificationType";

const INSTANCE_ID = Math.random().toString(16).slice(2);

console.log("[BOOT] instance =", INSTANCE_ID);
console.log("[ENV] RATE_LIMIT_MAX =", process.env.RATE_LIMIT_MAX);
console.log("[ENV] RATE_LIMIT_WINDOW =", process.env.RATE_LIMIT_WINDOW);
console.log("[ENV] SENDGRID_FAILURE_RATE =", process.env.SENDGRID_FAILURE_RATE);

const rateLimitMax = Number(process.env.RATE_LIMIT_MAX ?? 1);
const rateLimitWindow = Number(process.env.RATE_LIMIT_WINDOW ?? 10);

const manager = new NotificationManager(
  [new SendGridMockProvider(), new TwilioMockProvider()],
  new InMemoryRateLimiter(rateLimitMax, rateLimitWindow),
  new InMemoryCache(),
  new InMemoryNotificationQueue()
);

const app = express();
app.use(express.json());

type NotificationPayload = {
  userId: string;
  message: string;
  type: NotificationType;
};

function isValidPayload(x: any): x is NotificationPayload {
  return (
    x &&
    typeof x.userId === "string" &&
    x.userId.length > 0 &&
    typeof x.message === "string" &&
    x.message.length > 0 &&
    typeof x.type === "string" &&
    x.type.length > 0
  );
}

app.post("/sendNotification", async (req, res) => {
  console.log("[REQ] instance =", INSTANCE_ID);

  const payload = req.body;
  const items = Array.isArray(payload) ? payload : [payload];

  for (const item of items) {
    if (!isValidPayload(item)) {
      return res.status(400).json({
        error: "Missing required fields",
        expected: {
          userId: "string",
          message: "string",
          type: "MARKETING | TRANSACTIONAL",
        },
      });
    }
  }

  try {
    for (const item of items as NotificationPayload[]) {
      await manager.enqueue({
        userId: item.userId,
        message: item.message,
        type: item.type,
      });
    }

    const results = await manager.processQueue();
    console.log("[SUMMARY]", results);

    const counts = results.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ok = (counts.failed ?? 0) === 0;
    return res.status(200).json({
      status: ok ? "ok" : "partial",
      counts,
      results,
    });
  } catch (err: any) {
    if (String(err?.message).includes("Rate limit exceeded")) {
      return res.status(429).json({ error: "Rate limit exceeded" });
    }
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`Local API running on http://localhost:${port}`);
});
