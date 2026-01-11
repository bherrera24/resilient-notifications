"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryRateLimiter = void 0;
class InMemoryRateLimiter {
    constructor(limit, windowSeconds) {
        this.limit = limit;
        this.windowSeconds = windowSeconds;
        this.hits = new Map();
    }
    canSend(userId) {
        const now = Date.now();
        const windowStart = now - this.windowSeconds * 1000;
        const timestamps = this.hits.get(userId) ?? [];
        const valid = timestamps.filter(t => t > windowStart);
        if (valid.length >= this.limit) {
            return false;
        }
        valid.push(now);
        this.hits.set(userId, valid);
        return true;
    }
}
exports.InMemoryRateLimiter = InMemoryRateLimiter;
