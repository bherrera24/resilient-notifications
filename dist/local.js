"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NotificationManager_1 = require("./Application/NotificationManager");
const SendGridMockProvider_1 = require("./Infrastructure/Providers/SendGridMockProvider");
const TwilioMockProvider_1 = require("./Infrastructure/Providers/TwilioMockProvider");
const InMemoryRateLimiter_1 = require("./Infrastructure/Services/InMemoryRateLimiter");
const InMemoryCache_1 = require("./Infrastructure/Cache/InMemoryCache");
const InMemoryNotificationQueue_1 = require("./Infrastructure/Queue/InMemoryNotificationQueue");
const NotificationType_1 = require("./Domain/Entities/NotificationType");
const manager = new NotificationManager_1.NotificationManager([new SendGridMockProvider_1.SendGridMockProvider(), new TwilioMockProvider_1.TwilioMockProvider()], new InMemoryRateLimiter_1.InMemoryRateLimiter(5, 60), new InMemoryCache_1.InMemoryCache(), new InMemoryNotificationQueue_1.InMemoryNotificationQueue());
(async () => {
    console.log("=== First run ===");
    await manager.enqueue({
        userId: "user1",
        message: "Promo 20%",
        type: NotificationType_1.NotificationType.MARKETING,
    });
    await manager.enqueue({
        userId: "user1",
        message: "Order confirmed",
        type: NotificationType_1.NotificationType.TRANSACTIONAL,
    });
    await manager.processQueue();
    console.log("\n=== Second run (should hit cache) ===");
    await manager.enqueue({
        userId: "user1",
        message: "Promo 20%",
        type: NotificationType_1.NotificationType.MARKETING,
    });
    await manager.enqueue({
        userId: "user1",
        message: "Order confirmed",
        type: NotificationType_1.NotificationType.TRANSACTIONAL,
    });
    await manager.processQueue();
})();
