import { IRateLimiter } from '../../Domain/Interfaces/IRateLimiter';

export class InMemoryRateLimiter implements IRateLimiter {
  private hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowSeconds: number
  ) {}

  canSend(userId: string): boolean {
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
