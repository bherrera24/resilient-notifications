"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NotificationManager_1 = require("../Application/NotificationManager");
const InMemoryRateLimiter_1 = require("../Infrastructure/Services/InMemoryRateLimiter");
const NotificationType_1 = require("../Domain/Entities/NotificationType");
class FailingProvider {
    async send() {
        throw new Error("Provider failed");
    }
}
class SuccessfulProvider {
    constructor() {
        this.sent = false;
    }
    async send() {
        this.sent = true;
    }
}
describe("NotificationManager Failover", () => {
    it("should fallback to next provider when one fails", async () => {
        const failing = new FailingProvider();
        const success = new SuccessfulProvider();
        const manager = new NotificationManager_1.NotificationManager([failing, success], new InMemoryRateLimiter_1.InMemoryRateLimiter(10, 10));
        await manager.send({
            userId: "user1",
            message: "Test failover",
            type: NotificationType_1.NotificationType.TRANSACTIONAL,
        });
        expect(success.sent).toBe(true);
    });
});
