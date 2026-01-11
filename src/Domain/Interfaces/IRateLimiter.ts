export interface IRateLimiter {
  canSend(userId: string): boolean;
}
