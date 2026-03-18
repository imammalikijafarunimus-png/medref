'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, Command } from 'lucide-react';
import { trackSearch } from '@/lib/actions/track';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SearchResult, GroupedSearchResults } from '@/types';
import { SearchResultsDropdown } from './search-results-dropdown';
import { SearchEmptyState, NoResultsState, useRecentSearches } from './search-empty-state';

// =============================================================================
// TYPES
// =============================================================================

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
  showShortcutHint?: boolean;
}

// =============================================================================
// KEYBOARD SHORTCUT HOOK
// =============================================================================

function useKeyboardShortcut(
  callback: () => void,
  key: string = 'k',
  modifier: 'meta' | 'ctrl' = 'meta'
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMetaPressed = modifier === 'meta' ? e.metaKey || e.ctrlKey : e.ctrlKey;

      if (isMetaPressed && e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [callback, key, modifier]);
}

// =============================================================================
// MAIN SEARCH BAR COMPONENT
// =============================================================================

export function SearchBar({
  placeholder = 'Cari obat, herbal, gejala, catatan klinis...',
  className,
  autoFocus = false,
  onSearch,
  showShortcutHint = true,
}: SearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GroupedSearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Recent searches
  const { addRecentSearch } = useRecentSearches();

  // Flatten results for keyboard navigation
  const flattenedResults = useMemo(() => {
    if (!results) return [];
    const flat: SearchResult[] = [];
    ['drug', 'herbal', 'symptom', 'note'].forEach((type) => {
      const key = `${type}s` as keyof GroupedSearchResults;
      const items = results[key] as SearchResult[];
      if (items?.length) flat.push(...items);
    });
    return flat;
  }, [results]);

  const totalResults = flattenedResults.length;

  // Focus input on keyboard shortcut
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
    setIsOpen(true);
  }, []);

  useKeyboardShortcut(focusInput);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&grouped=true&limit=20`
      );
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Handle result selection
  const handleSelectResult = useCallback(
    (result: SearchResult) => {
      setIsOpen(false);
      setQuery('');
      addRecentSearch(result.name, result.type);

      const routes: Record<string, string> = {
        drug: '/drugs',
        herbal: '/herbals',
        note: '/notes',
        symptom: '/symptoms',
      };

      router.push(`${routes[result.type]}/${result.id}`);
    },
    [router, addRecentSearch]
  );

  // Handle form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        setIsOpen(false);
        addRecentSearch(query.trim());

        // Track search query (fire-and-forget)
        trackSearch(query.trim()).catch(() => {});

        if (onSearch) {
          onSearch(query.trim());
        } else {
          router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
      }
    },
    [query, onSearch, router, addRecentSearch]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, totalResults - 1));
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;

        case 'Enter':
          e.preventDefault();
          if (flattenedResults[selectedIndex]) {
            handleSelectResult(flattenedResults[selectedIndex]);
          } else if (query.trim()) {
            handleSubmit(e);
          }
          break;

        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          inputRef.current?.blur();
          break;

        case 'Tab':
          setIsOpen(false);
          break;
      }
    },
    [totalResults, selectedIndex, flattenedResults, handleSelectResult, handleSubmit, query]
  );

  // Handle input focus
  const handleFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Handle query selection from empty state
  const handleSelectQuery = useCallback((selectedQuery: string) => {
    setQuery(selectedQuery);
    inputRef.current?.focus();
  }, []);

  // Clear search
  const handleClear = useCallback(() => {
    setQuery('');
    setResults(null);
    inputRef.current?.focus();
  }, []);

  // Determine what to show in dropdown
  const showEmptyState = isOpen && query.trim().length < 2;
  const showResults = isOpen && query.trim().length >= 2 && results;
  const showNoResults = isOpen && query.trim().length >= 2 && results && results.totalResults === 0;

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Search Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        {/* Search Icon */}
        <Search
          className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors',
            isOpen ? 'text-primary' : 'text-muted-foreground'
          )}
        />

        {/* Input Field */}
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-label="Pencarian"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls="search-results"
          autoComplete="off"
          className={cn(
            'pl-10 pr-16 h-12 text-base',
            'transition-all duration-200',
            'focus-visible:ring-2 focus-visible:ring-primary/30',
            isOpen && 'ring-2 ring-primary/20'
          )}
        />

        {/* Right side: Clear / Loading / Shortcut */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* Loading Spinner */}
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}

          {/* Clear Button */}
          {query && !isLoading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleClear}
              aria-label="Hapus pencarian"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {/* Keyboard Shortcut Hint */}
          {showShortcutHint && !query && !isOpen && (
            <div className="hidden sm:flex items-center gap-0.5 px-1.5 py-1 rounded border border-border/50 bg-muted/30 text-muted-foreground">
              <Command className="h-3 w-3" />
              <span className="text-[10px] font-medium">K</span>
            </div>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {isOpen && (
        <div
          id="search-results"
          className={cn(
            'absolute top-full left-0 right-0 mt-2',
            'bg-popover border border-border rounded-lg shadow-lg',
            'z-50 overflow-hidden',
            'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-2',
            'motion-safe:duration-200'
          )}
        >
          {/* Empty State (Recent Searches + Quick Actions) */}
          {showEmptyState && (
            <SearchEmptyState
              onSelectQuery={handleSelectQuery}
              onClose={() => setIsOpen(false)}
            />
          )}

          {/* Search Results */}
          {showResults && (
            <SearchResultsDropdown
              results={results}
              query={query}
              selectedIndex={selectedIndex}
              onSelect={handleSelectResult}
              onHover={setSelectedIndex}
              onViewAll={() => {
                if (query.trim()) {
                  setIsOpen(false);
                  addRecentSearch(query.trim());
                  // Track search query (fire-and-forget)
                  trackSearch(query.trim()).catch(() => {});
                  if (onSearch) {
                    onSearch(query.trim());
                  } else {
                    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                  }
                }
              }}
              isLoading={isLoading}
            />
          )}

          {/* No Results */}
          {showNoResults && <NoResultsState query={query} onClear={handleClear} />}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// COMPACT SEARCH BAR VARIANT
// =============================================================================

interface CompactSearchBarProps extends SearchBarProps {
  onClick?: () => void;
}

export function CompactSearchBar({
  placeholder = 'Cari...',
  className,
  onClick,
  showShortcutHint = true,
}: CompactSearchBarProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5',
        'bg-muted/30 hover:bg-muted/50 border border-border rounded-lg',
        'text-muted-foreground text-sm text-left',
        'transition-colors',
        className
      )}
    >
      <Search className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{placeholder}</span>
      {showShortcutHint && (
        <div className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border/50 bg-background text-muted-foreground">
          <Command className="h-3 w-3" />
          <span className="text-[10px] font-medium">K</span>
        </div>
      )}
    </button>
  );
}