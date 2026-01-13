"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationManager = void 0;
class NotificationManager {
    constructor(providers, rateLimiter, cache, queue) {
        this.providers = providers;
        this.rateLimiter = rateLimiter;
        this.cache = cache;
        this.queue = queue;
    }
    async enqueue(notification) {
        this.queue.enqueue(notification);
    }
    async processQueue() {
        while (!this.queue.isEmpty()) {
            const notification = this.queue.dequeue();
            if (!notification)
                continue;
            try {
                await this.send(notification);
            }
            catch (error) {
                console.error("Failed to process notification", error);
            }
        }
    }
    getCacheKey(notification) {
        return `notification:${notification.userId}:${notification.message}`;
    }
    markAsSent(notification) {
        const cacheKey = this.getCacheKey(notification);
        this.cache.set(cacheKey, true, NotificationManager.CACHE_TTL_SECONDS);
        console.log("[CACHE SET] Stored notification:", cacheKey, notification.type);
    }
    isAlreadySent(notification) {
        const cacheKey = this.getCacheKey(notification);
        const cached = this.cache.get(cacheKey);
        if (cached) {
            console.log("[CACHE HIT] Notification already sent:", cacheKey);
            return true;
        }
        return false;
    }
    ensureRateLimit(notification) {
        if (!this.rateLimiter.canSend(notification.userId)) {
            throw new Error("Rate limit exceeded");
        }
    }
    async trySendWithFailover(notification) {
        for (const provider of this.providers) {
            try {
                console.log(`Trying provider: ${provider.constructor.name}`);
                await provider.send(notification);
                console.log(`Success with ${provider.constructor.name}`);
                return;
            }
            catch (error) {
                console.error(`Failed with ${provider.constructor.name}`);
            }
        }
        throw new Error("All providers failed");
    }
    async send(notification) {
        if (this.isAlreadySent(notification))
            return;
        this.ensureRateLimit(notification);
        await this.trySendWithFailover(notification);
        this.markAsSent(notification);
    }
}
exports.NotificationManager = NotificationManager;
NotificationManager.CACHE_TTL_SECONDS = 60;
