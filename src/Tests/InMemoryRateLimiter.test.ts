import { InMemoryRateLimiter } from "../Infrastructure/Services/InMemoryRateLimiter";

describe("InMemoryRateLimiter", () => {
  it("should allow messages within the limit", () => {
    const limiter = new InMemoryRateLimiter(2, 10);

    expect(limiter.canSend("user1")).toBe(true);
    expect(limiter.canSend("user1")).toBe(true);
  });

  it("should block messages exceeding the limit", () => {
    const limiter = new InMemoryRateLimiter(2, 10);

    limiter.canSend("user1");
    limiter.canSend("user1");

    expect(limiter.canSend("user1")).toBe(false);
  });
});
