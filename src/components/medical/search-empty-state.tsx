'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Calculator,
  FlaskConical,
  AlertTriangle,
  FileText,
  TrendingUp,
  X,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// STORAGE KEYS
// =============================================================================

const RECENT_SEARCHES_KEY = 'medref_recent_searches';
const MAX_RECENT_SEARCHES = 5;

// =============================================================================
// RECENT SEARCHES HOOK
// =============================================================================

interface RecentSearch {
  query: string;
  timestamp: number;
  type?: 'drug' | 'herbal' | 'symptom' | 'note';
}

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const addRecentSearch = (query: string, type?: RecentSearch['type']) => {
    if (!query.trim()) return;

    setRecentSearches((prev) => {
      // Remove duplicate
      const filtered = prev.filter((s) => s.query.toLowerCase() !== query.toLowerCase());
      // Add new at beginning
      const updated = [
        { query: query.trim(), timestamp: Date.now(), type },
        ...filtered,
      ].slice(0, MAX_RECENT_SEARCHES);

      // Persist
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // Ignore localStorage errors
      }

      return updated;
    });
  };

  const removeRecentSearch = (query: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s.query !== query);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore
    }
  };

  return {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  };
}

// =============================================================================
// QUICK ACTIONS CONFIG
// =============================================================================

const QUICK_ACTIONS = [
  {
    id: 'calculator',
    label: 'Kalkulator Medis',
    href: '/kalkulator',
    icon: Calculator,
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30',
  },
  {
    id: 'lab-values',
    label: 'Nilai Normal Lab',
    href: '/lab-values',
    icon: FlaskConical,
    color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30',
  },
  {
    id: 'interactions',
    label: 'Cek Interaksi',
    href: '/interaksi',
    icon: AlertTriangle,
    color: 'text-red-600 bg-red-50 dark:bg-red-950/30',
  },
  {
    id: 'notes',
    label: 'Catatan Klinis',
    href: '/notes',
    icon: FileText,
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30',
  },
] as const;

// =============================================================================
// SEARCH EMPTY STATE
// =============================================================================

interface SearchEmptyStateProps {
  onSelectQuery: (query: string) => void;
  onClose?: () => void;
}

export function SearchEmptyState({ onSelectQuery, onClose }: SearchEmptyStateProps) {
  const router = useRouter();
  const { recentSearches, removeRecentSearch, clearRecentSearches } = useRecentSearches();

  const handleQuickAction = (href: string) => {
    onClose?.();
    router.push(href);
  };

  return (
    <div className="py-2">
      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Terakhir Dicari</span>
            </div>
            <button
              type="button"
              onClick={clearRecentSearches}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Hapus semua
            </button>
          </div>
          <div className="space-y-0.5">
            {recentSearches.map((search) => (
              <button
                key={search.query}
                type="button"
                onClick={() => onSelectQuery(search.query)}
                className="w-full px-2 py-2 flex items-center gap-3 rounded-md hover:bg-muted/50 transition-colors text-left group"
              >
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm flex-1 truncate">{search.query}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRecentSearch(search.query);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all"
                  aria-label={`Hapus "${search.query}"`}
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      {recentSearches.length > 0 && <div className="h-px bg-border mx-3 my-2" />}

      {/* Quick Actions */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <TrendingUp className="h-4 w-4" />
          <span className="text-xs font-medium">Aksi Cepat</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => handleQuickAction(action.href)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-lg text-left',
                  'hover:bg-muted/50 transition-colors',
                  'border border-border/50'
                )}
              >
                <div className={cn('p-1.5 rounded-md', action.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium truncate">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Keyboard hints */}
      <div className="px-3 py-2 mt-1 border-t border-border/50">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
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
  );
}

// =============================================================================
// NO RESULTS STATE
// =============================================================================

interface NoResultsStateProps {
  query: string;
  onClear?: () => void;
}

export function NoResultsState({ query, onClear }: NoResultsStateProps) {
  return (
    <div className="px-4 py-8 text-center">
      <Search className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
      <p className="text-muted-foreground font-medium">Tidak ada hasil</p>
      <p className="text-sm text-muted-foreground/70 mt-1">
        Tidak ditemukan untuk "{query}"
      </p>
      <p className="text-xs text-muted-foreground/50 mt-2">
        Coba kata kunci lain atau periksa ejaan
      </p>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Hapus pencarian
        </button>
      )}
    </div>
  );
}