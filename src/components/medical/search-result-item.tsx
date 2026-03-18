'use client';

import { Pill, Leaf, Activity, FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SearchResult } from '@/types';

// =============================================================================
// CATEGORY CONFIGURATION — Uses semantic design tokens
// =============================================================================

export const CATEGORY_CONFIG = {
  drug: {
    icon: Pill,
    label: 'Obat',
    labelPlural: 'Obat',
    colorClass: 'text-[var(--cat-general)]',
    bgClass: 'bg-[var(--cat-general-subtle)]',
    borderColor: 'border-[var(--cat-general-subtle)]',
    hoverBg: 'hover:bg-[var(--cat-general-subtle)]/50',
  },
  herbal: {
    icon: Leaf,
    label: 'Herbal',
    labelPlural: 'Herbal',
    colorClass: 'text-[var(--safety-safe)]',
    bgClass: 'bg-[var(--safety-safe-subtle)]',
    borderColor: 'border-[var(--safety-safe-subtle)]',
    hoverBg: 'hover:bg-[var(--safety-safe-subtle)]/50',
  },
  symptom: {
    icon: Activity,
    label: 'Gejala',
    labelPlural: 'Gejala',
    colorClass: 'text-[var(--warning)]',
    bgClass: 'bg-[var(--warning-subtle)]',
    borderColor: 'border-[var(--warning-subtle)]',
    hoverBg: 'hover:bg-[var(--warning-subtle)]/50',
  },
  note: {
    icon: FileText,
    label: 'Catatan',
    labelPlural: 'Catatan Klinis',
    colorClass: 'text-[var(--info)]',
    bgClass: 'bg-[var(--info-subtle)]',
    borderColor: 'border-[var(--info-subtle)]',
    hoverBg: 'hover:bg-[var(--info-subtle)]/50',
  },
} as const;

export type SearchCategory = keyof typeof CATEGORY_CONFIG;

// =============================================================================
// HIGHLIGHT MATCH — Highlights matching text in results
// =============================================================================

interface HighlightMatchProps {
  text: string;
  query: string;
  className?: string;
}

export function HighlightMatch({ text, query, className }: HighlightMatchProps) {
  if (!query.trim()) {
    return <span className={className}>{text}</span>;
  }

  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  const startIndex = normalizedText.indexOf(normalizedQuery);

  if (startIndex === -1) {
    return <span className={className}>{text}</span>;
  }

  const endIndex = startIndex + query.length;
  const before = text.slice(0, startIndex);
  const match = text.slice(startIndex, endIndex);
  const after = text.slice(endIndex);

  return (
    <span className={className}>
      {before}
      <mark className="bg-transparent font-semibold text-foreground decoration-2 underline underline-offset-2 decoration-primary/60">
        {match}
      </mark>
      {after}
    </span>
  );
}

// =============================================================================
// SEARCH RESULT ITEM
// =============================================================================

interface SearchResultItemProps {
  result: SearchResult;
  query: string;
  isSelected: boolean;
  onSelect: (result: SearchResult) => void;
  onHover: () => void;
  showDescription?: boolean;
}

export function SearchResultItem({
  result,
  query,
  isSelected,
  onSelect,
  onHover,
  showDescription = true,
}: SearchResultItemProps) {
  const config = CATEGORY_CONFIG[result.type];
  const Icon = config.icon;

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      data-selected={isSelected}
      onClick={() => onSelect(result)}
      onMouseEnter={onHover}
      className={cn(
        'w-full px-3 py-2.5 flex items-center gap-3 text-left transition-colors duration-100',
        'focus:outline-none',
        isSelected
          ? 'bg-primary/5 border-l-2 border-l-primary'
          : 'border-l-2 border-l-transparent',
        config.hoverBg
      )}
    >
      {/* Icon container */}
      <div
        className={cn(
          'shrink-0 p-2 rounded-lg transition-colors',
          config.bgClass
        )}
      >
        <Icon className={cn('h-4 w-4', config.colorClass)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title with highlighted match */}
        <HighlightMatch
          text={result.name}
          query={query}
          className="font-medium text-sm text-foreground truncate block"
        />

        {/* Description / Category */}
        {showDescription && (result.description || result.category) && (
          <div className="flex items-center gap-2 mt-0.5">
            {result.category && (
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded',
                  config.bgClass,
                  config.colorClass
                )}
              >
                {result.category}
              </span>
            )}
            {result.description && (
              <span className="text-xs text-muted-foreground truncate">
                {result.description}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Match type badge / Chevron */}
      <div className="shrink-0 flex items-center gap-2">
        {result.matchType === 'fuzzy' && (
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            Mirip
          </span>
        )}
        {isSelected && (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </button>
  );
}

// =============================================================================
// SEARCH CATEGORY HEADER
// =============================================================================

interface SearchCategoryHeaderProps {
  category: SearchCategory;
  count: number;
  onViewAll?: () => void;
}

export function SearchCategoryHeader({
  category,
  count,
  onViewAll,
}: SearchCategoryHeaderProps) {
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'px-3 py-2 flex items-center gap-2 border-b border-border/50',
        config.bgClass
      )}
    >
      <Icon className={cn('h-4 w-4', config.colorClass)} />
      <span className={cn('font-medium text-sm', config.colorClass)}>
        {config.labelPlural}
      </span>
      <span className="ml-auto text-xs text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded">
        {count}
      </span>
      {onViewAll && (
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs text-primary hover:underline"
        >
          Lihat semua
        </button>
      )}
    </div>
  );
}