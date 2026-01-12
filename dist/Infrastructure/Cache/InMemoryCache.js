"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryCache = void 0;
class InMemoryCache {
    constructor() {
        this.store = new Map();
    }
    get(key) {
        const entry = this.store.get(key);
        if (!entry)
            return null;
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }
    set(key, value, ttlSeconds) {
        const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
        this.store.set(key, { value, expiresAt });
    }
}
exports.InMemoryCache = InMemoryCache;
