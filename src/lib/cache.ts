/**
 * Cache Layer untuk optimasi performa
 * Menggunakan in-memory cache dengan TTL (Time To Live)
 */

interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<unknown>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired items setiap 5 menit
    if (typeof window === 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key) as CacheItem<T> | undefined;
    
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// Singleton instance
export const cache = new MemoryCache();

// Cache key generators
export const CacheKeys = {
  drugs: {
    list: (page = 1, limit = 20, drugClass?: string) => 
      `drugs:list:${page}:${limit}:${drugClass || 'all'}`,
    detail: (id: string) => `drugs:detail:${id}`,
    search: (query: string) => `drugs:search:${query}`,
    classes: () => 'drugs:classes',
  },
  herbals: {
    list: (page = 1, limit = 20) => `herbals:list:${page}:${limit}`,
    detail: (id: string) => `herbals:detail:${id}`,
    search: (query: string) => `herbals:search:${query}`,
  },
  notes: {
    list: (page = 1, limit = 20, category?: string) => 
      `notes:list:${page}:${limit}:${category || 'all'}`,
    detail: (id: string) => `notes:detail:${id}`,
    categories: () => 'notes:categories',
  },
  symptoms: {
    list: (page = 1, limit = 20) => `symptoms:list:${page}:${limit}`,
    detail: (id: string) => `symptoms:detail:${id}`,
  },
  search: {
    global: (query: string, type: string) => `search:global:${query}:${type}`,
  },
  counts: {
    homepage: () => 'counts:homepage',
  },
};

// Cache TTL (Time To Live) dalam milidetik
export const CacheTTL = {
  search: 30 * 1000,      // 30 detik
  list: 2 * 60 * 1000,    // 2 menit
  detail: 5 * 60 * 1000,  // 5 menit
  static: 15 * 60 * 1000, // 15 menit
};