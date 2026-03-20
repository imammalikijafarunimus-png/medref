// =============================================
// Unit Tests for Cache Layer
// =============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cache, CacheKeys, CacheTTL } from './cache'

// ─────────────────────────────────────────
// CACHE OPERATIONS TESTS
// ─────────────────────────────────────────

describe('MemoryCache', () => {
  beforeEach(() => {
    cache.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('set and get', () => {
    it('should store and retrieve a value', () => {
      cache.set('test-key', { data: 'test' }, 60000)
      const result = cache.get<{ data: string }>('test-key')
      expect(result).toEqual({ data: 'test' })
    })

    it('should return null for non-existent key', () => {
      const result = cache.get('non-existent')
      expect(result).toBeNull()
    })

    it('should return null for expired item', () => {
      cache.set('test-key', 'value', 1000) // 1 second TTL
      vi.advanceTimersByTime(1001)
      const result = cache.get('test-key')
      expect(result).toBeNull()
    })

    it('should return value before expiration', () => {
      cache.set('test-key', 'value', 5000)
      vi.advanceTimersByTime(4999)
      const result = cache.get('test-key')
      expect(result).toBe('value')
    })

    it('should overwrite existing key', () => {
      cache.set('test-key', 'value1', 60000)
      cache.set('test-key', 'value2', 60000)
      expect(cache.get('test-key')).toBe('value2')
    })
  })

  describe('delete', () => {
    it('should delete a key', () => {
      cache.set('test-key', 'value', 60000)
      const deleted = cache.delete('test-key')
      expect(deleted).toBe(true)
      expect(cache.get('test-key')).toBeNull()
    })

    it('should return false for non-existent key', () => {
      const deleted = cache.delete('non-existent')
      expect(deleted).toBe(false)
    })
  })

  describe('deletePattern', () => {
    it('should delete keys matching pattern', () => {
      cache.set('drugs:list:1', 'data1', 60000)
      cache.set('drugs:list:2', 'data2', 60000)
      cache.set('herbals:list:1', 'data3', 60000)

      cache.deletePattern('^drugs:list:')

      expect(cache.get('drugs:list:1')).toBeNull()
      expect(cache.get('drugs:list:2')).toBeNull()
      expect(cache.get('herbals:list:1')).toBe('data3')
    })

    it('should handle regex special characters', () => {
      cache.set('test.key', 'value', 60000)
      cache.deletePattern('test\\.key')
      expect(cache.get('test.key')).toBeNull()
    })

    it('should not error when no keys match', () => {
      cache.set('test', 'value', 60000)
      expect(() => cache.deletePattern('^nonexistent:')).not.toThrow()
    })
  })

  describe('clear', () => {
    it('should clear all items', () => {
      cache.set('key1', 'value1', 60000)
      cache.set('key2', 'value2', 60000)
      cache.clear()
      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBeNull()
    })
  })
})

// ─────────────────────────────────────────
// CACHE KEYS GENERATOR TESTS
// ─────────────────────────────────────────

describe('CacheKeys', () => {
  describe('drugs', () => {
    it('should generate list key with default params', () => {
      const key = CacheKeys.drugs.list()
      expect(key).toBe('drugs:list:1:20:all')
    })

    it('should generate list key with custom params', () => {
      const key = CacheKeys.drugs.list(2, 50, 'analgesik')
      expect(key).toBe('drugs:list:2:50:analgesik')
    })

    it('should generate detail key', () => {
      const key = CacheKeys.drugs.detail('drug-123')
      expect(key).toBe('drugs:detail:drug-123')
    })

    it('should generate search key', () => {
      const key = CacheKeys.drugs.search('paracetamol')
      expect(key).toBe('drugs:search:paracetamol')
    })

    it('should generate classes key', () => {
      const key = CacheKeys.drugs.classes()
      expect(key).toBe('drugs:classes')
    })
  })

  describe('herbals', () => {
    it('should generate list key with number param (legacy)', () => {
      const key = CacheKeys.herbals.list(1, 20)
      expect(key).toBe('herbals:list:1:20')
    })

    it('should generate list key with object param', () => {
      const key = CacheKeys.herbals.list({
        halaman: 2,
        batas: 30,
        cari: 'jahe',
        keamanan: 'aman',
      })
      expect(key).toBe('herbals:list:2:30:jahe:aman')
    })

    it('should use defaults for object param', () => {
      const key = CacheKeys.herbals.list({})
      expect(key).toBe('herbals:list:1:20::')
    })

    it('should generate detail key', () => {
      const key = CacheKeys.herbals.detail('herbal-456')
      expect(key).toBe('herbals:detail:herbal-456')
    })

    it('should generate search key', () => {
      const key = CacheKeys.herbals.search('ginger')
      expect(key).toBe('herbals:search:ginger')
    })
  })

  describe('notes', () => {
    it('should generate list key with defaults', () => {
      const key = CacheKeys.notes.list()
      expect(key).toBe('notes:list:1:20:all')
    })

    it('should generate list key with category', () => {
      const key = CacheKeys.notes.list(1, 20, 'Cardiology')
      expect(key).toBe('notes:list:1:20:Cardiology')
    })

    it('should generate detail key', () => {
      const key = CacheKeys.notes.detail('note-789')
      expect(key).toBe('notes:detail:note-789')
    })

    it('should generate categories key', () => {
      const key = CacheKeys.notes.categories()
      expect(key).toBe('notes:categories')
    })
  })

  describe('symptoms', () => {
    it('should generate list key with defaults', () => {
      const key = CacheKeys.symptoms.list()
      expect(key).toBe('symptoms:list:1:20')
    })

    it('should generate list key with custom params', () => {
      const key = CacheKeys.symptoms.list(3, 50)
      expect(key).toBe('symptoms:list:3:50')
    })

    it('should generate detail key', () => {
      const key = CacheKeys.symptoms.detail('symptom-123')
      expect(key).toBe('symptoms:detail:symptom-123')
    })
  })

  describe('search', () => {
    it('should generate global search key', () => {
      const key = CacheKeys.search.global('fever', 'drugs')
      expect(key).toBe('search:global:fever:drugs')
    })
  })

  describe('counts', () => {
    it('should generate homepage counts key', () => {
      const key = CacheKeys.counts.homepage()
      expect(key).toBe('counts:homepage')
    })
  })
})

// ─────────────────────────────────────────
// CACHE TTL CONSTANTS TESTS
// ─────────────────────────────────────────

describe('CacheTTL', () => {
  it('should have correct TTL values', () => {
    expect(CacheTTL.search).toBe(30 * 1000) // 30 seconds
    expect(CacheTTL.list).toBe(2 * 60 * 1000) // 2 minutes
    expect(CacheTTL.detail).toBe(5 * 60 * 1000) // 5 minutes
    expect(CacheTTL.static).toBe(15 * 60 * 1000) // 15 minutes
  })

  it('should have increasing TTL order', () => {
    expect(CacheTTL.search).toBeLessThan(CacheTTL.list)
    expect(CacheTTL.list).toBeLessThan(CacheTTL.detail)
    expect(CacheTTL.detail).toBeLessThan(CacheTTL.static)
  })
})