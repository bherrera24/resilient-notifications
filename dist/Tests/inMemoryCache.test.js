"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const InMemoryCache_1 = require("../Infrastructure/Cache/InMemoryCache");
describe("InMemoryCache", () => {
    it("stores and retrieves a value", () => {
        const cache = new InMemoryCache_1.InMemoryCache();
        cache.set("key", "value", 60);
        const result = cache.get("key");
        expect(result).toBe("value");
    });
    it("returns null for missing keys", () => {
        const cache = new InMemoryCache_1.InMemoryCache();
        const result = cache.get("missing");
        expect(result).toBeNull();
    });
    it("expires value after ttl", async () => {
        const cache = new InMemoryCache_1.InMemoryCache();
        cache.set("key", "value", 1);
        expect(cache.get("key")).toBe("value");
        await new Promise((resolve) => setTimeout(resolve, 1100));
        expect(cache.get("key")).toBeNull();
    });
});
