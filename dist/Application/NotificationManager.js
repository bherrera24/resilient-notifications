"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationManager = void 0;
class NotificationManager {
    constructor(providers, rateLimiter) {
        this.providers = providers;
        this.rateLimiter = rateLimiter;
    }
    async send(notification) {
        if (!this.rateLimiter.canSend(notification.userId)) {
            throw new Error('Rate limit exceeded');
        }
        for (const provider of this.providers) {
            try {
                await provider.send(notification);
                return;
            }
            catch {
                // intento con el siguiente proveedor
            }
        }
        throw new Error('All providers failed');
    }
}
exports.NotificationManager = NotificationManager;
