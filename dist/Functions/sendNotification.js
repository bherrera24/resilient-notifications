"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const NotificationManager_1 = require("../Application/NotificationManager");
const SendGridMockProvider_1 = require("../Infrastructure/Providers/SendGridMockProvider");
const TwilioMockProvider_1 = require("../Infrastructure/Providers/TwilioMockProvider");
const InMemoryRateLimiter_1 = require("../Infrastructure/Services/InMemoryRateLimiter");
const InMemoryCache_1 = require("../Infrastructure/Cache/InMemoryCache");
const InMemoryNotificationQueue_1 = require("../Infrastructure/Queue/InMemoryNotificationQueue");
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX ?? 2);
const rateLimitWindow = Number(process.env.RATE_LIMIT_WINDOW ?? 10);
const manager = new NotificationManager_1.NotificationManager([new SendGridMockProvider_1.SendGridMockProvider(), new TwilioMockProvider_1.TwilioMockProvider()], new InMemoryRateLimiter_1.InMemoryRateLimiter(rateLimitMax, rateLimitWindow), new InMemoryCache_1.InMemoryCache(), new InMemoryNotificationQueue_1.InMemoryNotificationQueue());
const handler = async (event) => {
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Request body is required" }),
        };
    }
    let data;
    try {
        data = JSON.parse(event.body);
    }
    catch {
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
exports.handler = handler;
