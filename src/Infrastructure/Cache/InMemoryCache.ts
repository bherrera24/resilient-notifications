import { ICache } from "../../Domain/Interfaces/ICache";

type CacheEntry<T> = {
  value: T;
  expiresAt?: number;
};

export class InMemoryCache implements ICache {
  private store = new Map<string, CacheEntry<any>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) return null;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  set<T>(key: string, value: T, ttlSeconds?: number): void {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;

    this.store.set(key, { value, expiresAt });
  }
}
