export interface ICache {
  get<T>(key: String): T | null;
  set<T>(key: String, value: T, ttlSeconds?: number): void;
}
