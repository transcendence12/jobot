interface CacheItem<T> {
  data: T;
  timestamp: number;
  key: string;
}

export class Cache {
  private static instance: Cache;
  private cache: Map<string, CacheItem<any>>;
  private readonly TTL = 2 * 60 * 60 * 1000; // 2 hours

  private constructor() {
    this.cache = new Map();
  }

  static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      key,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > this.TTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  // Add these methods for debugging
  getTimestamp(key: string): number | null {
    const item = this.cache.get(key);
    return item ? item.timestamp : null;
  }

  debug(): void {
    console.log("Current cache contents:");
    this.cache.forEach((item, key) => {
      console.log(`Key: ${key}`);
      console.log(`Timestamp: ${new Date(item.timestamp).toLocaleString()}`);
      console.log(
        `Expires: ${new Date(item.timestamp + this.TTL).toLocaleString()}`
      );
      console.log("---");
    });
  }
}
