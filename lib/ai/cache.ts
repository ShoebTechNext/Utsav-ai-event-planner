/**
 * In-memory LRU Cache for AI Plan generation to prevent repeated costly API requests.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class LruCache<T> {
  private capacity: number;
  private ttlMs: number;
  private map = new Map<string, CacheEntry<T>>();

  constructor(capacity = 50, ttlMs = 60 * 60 * 1000) {
    this.capacity = capacity;
    this.ttlMs = ttlMs;
  }

  get(key: string): T | null {
    const entry = this.map.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return null;
    }

    // Refresh position for LRU
    this.map.delete(key);
    this.map.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.capacity) {
      // Evict oldest (first inserted in Map iterator)
      const oldestKey = this.map.keys().next().value;
      if (oldestKey) {
        this.map.delete(oldestKey);
      }
    }

    this.map.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  clear(): void {
    this.map.clear();
  }

  size(): number {
    return this.map.size;
  }
}

// Global singleton cache for generated plans
export const planCache = new LruCache<unknown>(50, 60 * 60 * 1000);

