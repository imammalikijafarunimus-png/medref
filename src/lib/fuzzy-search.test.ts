// =============================================
// Unit Tests for Fuzzy Search
// =============================================

import { describe, it, expect } from 'vitest'
import {
  jarakLevenshtein,
  rasioKemiripan,
  cocokFuzzy,
  cariFuzzy,
  sorotCocok,
  fuzzyMatch,
} from './fuzzy-search'

// ─────────────────────────────────────────
// LEVENSHTEIN DISTANCE TESTS
// ─────────────────────────────────────────

describe('jarakLevenshtein', () => {
  it('should return 0 for identical strings', () => {
    expect(jarakLevenshtein('hello', 'hello')).toBe(0)
  })

  it('should return length for empty string comparison', () => {
    expect(jarakLevenshtein('hello', '')).toBe(5)
    expect(jarakLevenshtein('', 'world')).toBe(5)
  })

  it('should calculate single character substitution', () => {
    expect(jarakLevenshtein('cat', 'bat')).toBe(1)
    expect(jarakLevenshtein('hello', 'hallo')).toBe(1)
  })

  it('should calculate single character insertion', () => {
    expect(jarakLevenshtein('cat', 'cats')).toBe(1)
    expect(jarakLevenshtein('test', 'tests')).toBe(1)
  })

  it('should calculate single character deletion', () => {
    expect(jarakLevenshtein('cats', 'cat')).toBe(1)
    expect(jarakLevenshtein('tests', 'test')).toBe(1)
  })

  it('should calculate multiple edits', () => {
    expect(jarakLevenshtein('kitten', 'sitting')).toBe(3)
    expect(jarakLevenshtein('saturday', 'sunday')).toBe(3)
  })

  it('should handle case sensitive comparison', () => {
    // The function does case-sensitive comparison
    expect(jarakLevenshtein('Hello', 'hello')).toBe(1)
  })
})

// ─────────────────────────────────────────
// SIMILARITY RATIO TESTS
// ─────────────────────────────────────────

describe('rasioKemiripan', () => {
  it('should return 1 for identical strings', () => {
    expect(rasioKemiripan('hello', 'hello')).toBe(1)
  })

  it('should return 0 for empty strings', () => {
    expect(rasioKemiripan('', 'hello')).toBe(0)
    expect(rasioKemiripan('hello', '')).toBe(0)
  })

  it('should return high ratio for similar strings', () => {
    const ratio = rasioKemiripan('paracetamol', 'paracetamole')
    expect(ratio).toBeGreaterThan(0.8)
  })

  it('should return low ratio for different strings', () => {
    const ratio = rasioKemiripan('abc', 'xyz')
    expect(ratio).toBeLessThan(0.5)
  })

  it('should be case insensitive', () => {
    expect(rasioKemiripan('Hello', 'hello')).toBe(1)
    expect(rasioKemiripan('PARACETAMOL', 'paracetamol')).toBe(1)
  })

  it('should calculate correct ratio for partial matches', () => {
    // 'test' vs 'testing' has distance 3, max length 7
    const ratio = rasioKemiripan('test', 'testing')
    expect(ratio).toBeCloseTo(1 - 3/7, 1)
  })
})

// ─────────────────────────────────────────
// FUZZY MATCH TESTS
// ─────────────────────────────────────────

describe('cocokFuzzy', () => {
  describe('exact matches', () => {
    it('should return 100 for exact match', () => {
      expect(cocokFuzzy('paracetamol', 'paracetamol')).toBe(100)
    })

    it('should be case insensitive for exact match', () => {
      expect(cocokFuzzy('PARACETAMOL', 'paracetamol')).toBe(100)
    })
  })

  describe('starts with matches', () => {
    it('should return 90 for starts with match', () => {
      expect(cocokFuzzy('paracetamol tablet', 'paracetamol')).toBe(90)
    })

    it('should handle short prefixes', () => {
      expect(cocokFuzzy('amoxicillin', 'amo')).toBe(90)
    })
  })

  describe('contains matches', () => {
    it('should return 75 for contains match', () => {
      expect(cocokFuzzy('tablet paracetamol 500mg', 'paracetamol')).toBe(75)
    })
  })

  describe('fuzzy matches', () => {
    it('should return positive score for similar strings', () => {
      const score = cocokFuzzy('paracetamole', 'paracetamol')
      expect(score).toBeGreaterThan(0)
    })

    it('should return 0 for very different strings', () => {
      const score = cocokFuzzy('completely different', 'xyz')
      expect(score).toBe(0)
    })
  })

  describe('threshold parameter', () => {
    it('should respect custom threshold', () => {
      // With low threshold, should match
      const lowThreshold = cocokFuzzy('paraceta', 'paracetamol', 0.3)
      expect(lowThreshold).toBeGreaterThan(0)
    })
  })

  describe('multi-word search', () => {
    it('should handle multi-word patterns', () => {
      const score = cocokFuzzy('paracetamol tablet', 'para tablet')
      expect(score).toBeGreaterThan(0)
    })
  })

  describe('alias function', () => {
    it('fuzzyMatch should be same as cocokFuzzy', () => {
      expect(fuzzyMatch('test', 'test')).toBe(cocokFuzzy('test', 'test'))
    })
  })
})

// ─────────────────────────────────────────
// FUZZY SEARCH TESTS
// ─────────────────────────────────────────

describe('cariFuzzy', () => {
  interface TestItem {
    id: string
    name: string
    description: string
  }

  const items: TestItem[] = [
    { id: '1', name: 'Paracetamol', description: 'Obat penurun demam' },
    { id: '2', name: 'Amoxicillin', description: 'Antibiotik' },
    { id: '3', name: 'Omeprazole', description: 'Obat maag' },
    { id: '4', name: 'Metformin', description: 'Obat diabetes' },
    { id: '5', name: 'Cetirizine', description: 'Antihistamin' },
  ]

  const getSearchableText = (item: TestItem) => [item.name, item.description]

  it('should find exact matches', () => {
    const results = cariFuzzy(items, 'Paracetamol', getSearchableText)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].item.name).toBe('Paracetamol')
    expect(results[0].tipeCocok).toBe('exact')
    expect(results[0].skor).toBe(100)
  })

  it('should find partial matches', () => {
    const results = cariFuzzy(items, 'para', getSearchableText)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].item.name).toBe('Paracetamol')
  })

  it('should return empty array for no matches', () => {
    const results = cariFuzzy(items, 'nonexistent', getSearchableText)
    expect(results).toEqual([])
  })

  it('should respect limit parameter', () => {
    const results = cariFuzzy(items, 'obat', getSearchableText, { limit: 2 })
    expect(results.length).toBeLessThanOrEqual(2)
  })

  it('should respect minSkor parameter', () => {
    const results = cariFuzzy(items, 'o', getSearchableText, { minSkor: 50 })
    results.forEach(result => {
      expect(result.skor).toBeGreaterThanOrEqual(50)
    })
  })

  it('should sort results by score descending', () => {
    const results = cariFuzzy(items, 'ol', getSearchableText)
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].skor).toBeGreaterThanOrEqual(results[i].skor)
    }
  })

  it('should search in multiple fields', () => {
    const results = cariFuzzy(items, 'diabetes', getSearchableText)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].item.name).toBe('Metformin')
  })

  it('should handle empty items array', () => {
    const results = cariFuzzy([], 'test', getSearchableText)
    expect(results).toEqual([])
  })

  it('should handle empty search pattern', () => {
    const results = cariFuzzy(items, '', getSearchableText, { minSkor: 0 })
    // Empty pattern might match nothing or return low scores
    expect(Array.isArray(results)).toBe(true)
  })
})

// ─────────────────────────────────────────
// HIGHLIGHT MATCHES TESTS
// ─────────────────────────────────────────

describe('sorotCocok', () => {
  it('should highlight exact match', () => {
    const result = sorotCocok('paracetamol', 'paracetamol')
    expect(result).toHaveLength(1)
    expect(result[0].cocok).toBe('paracetamol')
  })

  it('should highlight partial match', () => {
    const result = sorotCocok('paracetamol tablet', 'para')
    expect(result.length).toBeGreaterThan(0)
    // Find the segment with the match
    const matchSegment = result.find(r => r.cocok !== '')
    expect(matchSegment?.cocok.toLowerCase()).toBe('para')
  })

  it('should handle no match', () => {
    const result = sorotCocok('hello world', 'xyz')
    expect(result).toHaveLength(1)
    expect(result[0].cocok).toBe('')
    expect(result[0].sebelum).toBe('hello world')
  })

  it('should handle empty pattern', () => {
    const result = sorotCocok('test text', '')
    expect(result).toHaveLength(1)
    expect(result[0].cocok).toBe('test text')
  })

  it('should highlight multiple occurrences', () => {
    const result = sorotCocok('test test test', 'test')
    // Should have multiple highlighted segments
    const highlightedSegments = result.filter(r => r.cocok !== '')
    expect(highlightedSegments.length).toBe(3)
  })

  it('should be case insensitive', () => {
    const result = sorotCocok('PARACETAMOL', 'para')
    const matchSegment = result.find(r => r.cocok !== '')
    expect(matchSegment?.cocok.toLowerCase()).toBe('para')
  })

  it('should preserve text around match', () => {
    const result = sorotCocok('drug paracetamol tablet', 'paracetamol')
    // Check that surrounding text is preserved
    const allText = result.map(r => r.sebelum + r.cocok + r.sesudah).join('')
    expect(allText).toBe('drug paracetamol tablet')
  })
})