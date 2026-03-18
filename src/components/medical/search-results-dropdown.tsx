'use client';

import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SearchResult, GroupedSearchResults } from '@/types';
import {
  SearchResultItem,
  SearchCategoryHeader,
  CATEGORY_CONFIG,
  type SearchCategory,
} from './search-result-item';

// =============================================================================
// SEARCH RESULTS DROPDOWN
// =============================================================================

interface SearchResultsDropdownProps {
  results: GroupedSearchResults | null;
  query: string;
  selectedIndex: number;
  onSelect: (result: SearchResult) => void;
  onHover: (index: number) => void;
  onViewAll?: () => void;
  isLoading?: boolean;
}

// Order of categories in the dropdown
const CATEGORY_ORDER: SearchCategory[] = ['drug', 'herbal', 'symptom', 'note'];

export function SearchResultsDropdown({
  results,
  query,
  selectedIndex,
  onSelect,
  onHover,
  onViewAll,
  isLoading = false,
}: SearchResultsDropdownProps) {
  // Flatten results for keyboard navigation
  const flattenedResults = useMemo(() => {
    if (!results) return [];

    const flat: SearchResult[] = [];
    CATEGORY_ORDER.forEach((category) => {
      const categoryResults = results[`${category}s` as keyof GroupedSearchResults] as SearchResult[];
      if (categoryResults?.length) {
        flat.push(...categoryResults);
      }
    });
    return flat;
  }, [results]);

  // Calculate which category each index belongs to
  const getCategoryForIndex = (index: number): { category: SearchCategory; localIndex: number } | null => {
    let currentIndex = 0;
    for (const category of CATEGORY_ORDER) {
      const categoryResults = results?.[`${category}s` as keyof GroupedSearchResults] as SearchResult[];
      if (categoryResults?.length) {
        if (index >= currentIndex && index < currentIndex + categoryResults.length) {
          return { category, localIndex: index - currentIndex };
        }
        currentIndex += categoryResults.length;
      }
    }
    return null;
  };

  if (isLoading) {
    return <SearchResultsSkeleton />;
  }

  if (!results || results.totalResults === 0) {
    return null;
  }

  // Track category positions for rendering headers
  let globalIndex = 0;

  return (
    <div
      role="listbox"
      aria-label="Hasil pencarian"
      className="max-h-[60vh] overflow-y-auto scrollbar-thin"
    >
      {CATEGORY_ORDER.map((category) => {
        const categoryKey = `${category}s` as keyof GroupedSearchResults;
        const categoryResults = results[categoryKey] as SearchResult[];

        if (!categoryResults?.length) return null;

        const startIndex = globalIndex;
        globalIndex += categoryResults.length;

        return (
          <div key={category} className="border-b border-border last:border-b-0">
            {/* Category Header */}
            <SearchCategoryHeader
              category={category}
              count={categoryResults.length}
            />

            {/* Category Results */}
            <div role="group" aria-label={CATEGORY_CONFIG[category].labelPlural}>
              {categoryResults.map((result, localIndex) => {
                const absoluteIndex = startIndex + localIndex;
                const isSelected = absoluteIndex === selectedIndex;

                return (
                  <SearchResultItem
                    key={`${result.type}-${result.id}`}
                    result={result}
                    query={query}
                    isSelected={isSelected}
                    onSelect={onSelect}
                    onHover={() => onHover(absoluteIndex)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {/* View All Results Footer */}
      {results.totalResults > flattenedResults.length && (
        <button
          type="button"
          onClick={onViewAll}
          className="w-full px-4 py-3 flex items-center justify-center gap-2 hover:bg-muted/50 text-sm text-muted-foreground transition-colors border-t border-border"
        >
          <span>Lihat semua {results.totalResults} hasil</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// =============================================================================
// SEARCH RESULTS SKELETON
// =============================================================================

export function SearchResultsSkeleton() {
  return (
    <div className="p-3 space-y-3">
      {/* Category skeleton */}
      {[1, 2, 3].map((group) => (
        <div key={group} className="space-y-2">
          <div className="h-7 w-24 bg-muted rounded animate-pulse" />
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-3 py-2">
              <div className="h-9 w-9 bg-muted rounded-lg animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}