'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { SearchBar } from './search-bar';

// =============================================================================
// SEARCH CONTEXT
// =============================================================================

interface SearchContextValue {
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

// =============================================================================
// SEARCH PROVIDER
// =============================================================================

interface SearchProviderProps {
  children: ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);
  const toggleSearch = useCallback(() => setIsSearchOpen((prev) => !prev), []);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K on Mac, Ctrl+K on Windows/Linux
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleSearch();
      }

      // Escape to close
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleSearch, closeSearch, isSearchOpen]);

  return (
    <SearchContext.Provider value={{ isSearchOpen, openSearch, closeSearch, toggleSearch }}>
      {children}
    </SearchContext.Provider>
  );
}

// =============================================================================
// USE SEARCH HOOK
// =============================================================================

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}

// =============================================================================
// SEARCH MODAL COMPONENT
// =============================================================================

interface SearchModalProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export function SearchModal({ placeholder, onSearch }: SearchModalProps) {
  const { isSearchOpen, closeSearch } = useSearch();

  if (!isSearchOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={closeSearch}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-[10vh] z-50 mx-auto max-w-xl">
        <div
          className="bg-popover border border-border rounded-xl shadow-2xl overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Pencarian global"
        >
          <SearchBar
            placeholder={placeholder}
            autoFocus
            onSearch={(query) => {
              onSearch?.(query);
              closeSearch();
            }}
            showShortcutHint={false}
          />
        </div>

        {/* Keyboard hints */}
        <div className="mt-2 flex justify-center">
          <div className="flex items-center gap-3 text-xs text-muted-foreground bg-popover/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/50">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">↕</kbd>
              navigasi
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">↵</kbd>
              pilih
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">esc</kbd>
              tutup
            </span>
          </div>
        </div>
      </div>
    </>
  );
}