"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const NotificationManager_1 = require("../Application/NotificationManager");
const SendGridMockProvider_1 = require("../Infrastructure/Providers/SendGridMockProvider");
const TwilioMockProvider_1 = require("../Infrastructure/Providers/TwilioMockProvider");
const InMemoryRateLimiter_1 = require("../Infrastructure/Services/InMemoryRateLimiter");
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX ?? 2);
const rateLimitWindow = Number(process.env.RATE_LIMIT_WINDOW ?? 10);
const manager = new NotificationManager_1.NotificationManager([new SendGridMockProvider_1.SendGridMockProvider(), new TwilioMockProvider_1.TwilioMockProvider()], new InMemoryRateLimiter_1.InMemoryRateLimiter(rateLimitMax, rateLimitWindow));
const handler = async (event) => {
    const body = JSON.parse(event.body);
    await manager.send({
        userId: body.userId,
        message: body.message,
        type: body.type,
    });
    return {
        statusCode: 200,
        body: JSON.stringify({ status: "sent" }),
    };
};
exports.handler = handler;
