"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NotificationManager_1 = require("./Application/NotificationManager");
const SendGridMockProvider_1 = require("./Infrastructure/Providers/SendGridMockProvider");
const TwilioMockProvider_1 = require("./Infrastructure/Providers/TwilioMockProvider");
const InMemoryRateLimiter_1 = require("./Infrastructure/Services/InMemoryRateLimiter");
const NotificationType_1 = require("./Domain/Entities/NotificationType");
const manager = new NotificationManager_1.NotificationManager([new SendGridMockProvider_1.SendGridMockProvider(), new TwilioMockProvider_1.TwilioMockProvider()], new InMemoryRateLimiter_1.InMemoryRateLimiter(2, 10));
(async () => {
    await manager.send({
        userId: 'user1',
        message: 'Test local',
        type: NotificationType_1.NotificationType.TRANSACTIONAL
    });
})();
