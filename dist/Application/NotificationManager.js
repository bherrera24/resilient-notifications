"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationManager = void 0;
class NotificationManager {
    constructor(providers, rateLimiter, cache) {
        this.providers = providers;
        this.rateLimiter = rateLimiter;
        this.cache = cache;
    }
    async send(notification) {
        const cacheKey = `notification:${notification.userId}:${notification.message}`;
        // console.log("[ENV]", {
        //   RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
        //   RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW,
        //   SENDGRID_FAILURE_RATE: process.env.SENDGRID_FAILURE_RATE,
        // });
        const cached = this.cache.get(cacheKey);
        if (cached) {
            console.log("[CACHE HIT] Notification already sent:", cacheKey);
            return;
        }
        if (!this.rateLimiter.canSend(notification.userId)) {
            throw new Error("Rate limit exceeded");
        }
        for (const provider of this.providers) {
            try {
                console.log(`Trying provider: ${provider.constructor.name}`);
                await provider.send(notification);
                this.cache.set(cacheKey, true, 60);
                console.log("[CACHE SET] Stored notification:", cacheKey);
                console.log(`Success with ${provider.constructor.name}`);
                return;
            }
            catch (error) {
                console.error(`Failed with ${provider.constructor.name}`);
            }
        }
        throw new Error("All providers failed");
    }
}
exports.NotificationManager = NotificationManager;
