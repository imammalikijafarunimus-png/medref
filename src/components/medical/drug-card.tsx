'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Pill,
  ChevronRight,
  Heart,
  AlertTriangle,
  ShieldX,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Drug } from '@prisma/client';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export type DrugWithRelations = Drug & {
  doses?: { id: string; indication: string | null; adultDose: string }[];
  indications?: { indication: string }[];
  _count?: {
    interactions: number;
    contraindications: number;
  };
};

interface DrugCardProps {
  drug: DrugWithRelations;
  showInteractions?: boolean;
}

// ─────────────────────────────────────────────────────────────────
// Category Normalization
// ─────────────────────────────────────────────────────────────────

/** Normalize Indonesian/English category names to standard keys */
function normalizeCategory(cat?: string | null): string {
  if (!cat) return 'general';
  const normalized = cat.toLowerCase().trim();
  
  const mapping: Record<string, string> = {
    // Indonesian to English
    antibiotik: 'antibiotic',
    kardiovaskular: 'cardiovascular',
    respirasi: 'respiratory',
    neurologi: 'neurology',
    psikiatri: 'psychiatry',
    // Aliases
    antihypertensive: 'cardiovascular',
    antianginal: 'cardiovascular',
    antiarrhythmic: 'cardiovascular',
    'lipid-lowering': 'cardiovascular',
    anticoagulant: 'cardiovascular',
    antimigraine: 'neurology',
    hormonal: 'endocrine',
    thyroid: 'endocrine',
    antigout: 'analgesic',
    antihistamine: 'respiratory',
    antiemetic: 'gastrointestinal',
    laxative: 'gastrointestinal',
    corticosteroid: 'endocrine',
    diuretic: 'cardiovascular',
  };
  
  return mapping[normalized] || normalized;
}

// ─────────────────────────────────────────────────────────────────
// Category Color Map (using semantic CSS variables)
// ─────────────────────────────────────────────────────────────────

const categoryStyles: Record<string, { bg: string; text: string; badge: string }> = {
  analgesic: {
    bg: 'bg-[var(--cat-analgesic-subtle)]',
    text: 'text-[color:var(--cat-analgesic)]',
    badge: 'bg-[var(--cat-analgesic-subtle)] text-[color:var(--cat-analgesic)]',
  },
  antibiotic: {
    bg: 'bg-[var(--cat-antibiotic-subtle)]',
    text: 'text-[color:var(--cat-antibiotic)]',
    badge: 'bg-[var(--cat-antibiotic-subtle)] text-[color:var(--cat-antibiotic)]',
  },
  antiviral: {
    bg: 'bg-[var(--cat-antiviral-subtle)]',
    text: 'text-[color:var(--cat-antiviral)]',
    badge: 'bg-[var(--cat-antiviral-subtle)] text-[color:var(--cat-antiviral)]',
  },
  antifungal: {
    bg: 'bg-[var(--cat-antifungal-subtle)]',
    text: 'text-[color:var(--cat-antifungal)]',
    badge: 'bg-[var(--cat-antifungal-subtle)] text-[color:var(--cat-antifungal)]',
  },
  cardiovascular: {
    bg: 'bg-[var(--cat-cardiovascular-subtle)]',
    text: 'text-[color:var(--cat-cardiovascular)]',
    badge: 'bg-[var(--cat-cardiovascular-subtle)] text-[color:var(--cat-cardiovascular)]',
  },
  respiratory: {
    bg: 'bg-[var(--cat-respiratory-subtle)]',
    text: 'text-[color:var(--cat-respiratory)]',
    badge: 'bg-[var(--cat-respiratory-subtle)] text-[color:var(--cat-respiratory)]',
  },
  gastrointestinal: {
    bg: 'bg-[var(--cat-gastrointestinal-subtle)]',
    text: 'text-[color:var(--cat-gastrointestinal)]',
    badge: 'bg-[var(--cat-gastrointestinal-subtle)] text-[color:var(--cat-gastrointestinal)]',
  },
  neurology: {
    bg: 'bg-[var(--cat-neurology-subtle)]',
    text: 'text-[color:var(--cat-neurology)]',
    badge: 'bg-[var(--cat-neurology-subtle)] text-[color:var(--cat-neurology)]',
  },
  antidiabetic: {
    bg: 'bg-[var(--cat-antidiabetic-subtle)]',
    text: 'text-[color:var(--cat-antidiabetic)]',
    badge: 'bg-[var(--cat-antidiabetic-subtle)] text-[color:var(--cat-antidiabetic)]',
  },
  general: {
    bg: 'bg-[var(--cat-general-subtle)]',
    text: 'text-[color:var(--cat-general)]',
    badge: 'bg-[var(--cat-general-subtle)] text-[color:var(--cat-general)]',
  },
  // Additional categories with fallback colors
  psychiatry: {
    bg: 'bg-violet-100 dark:bg-violet-900/40',
    text: 'text-violet-600 dark:text-violet-300',
    badge: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  },
  endocrine: {
    bg: 'bg-purple-100 dark:bg-purple-900/40',
    text: 'text-purple-600 dark:text-purple-300',
    badge: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  },
};

const FALLBACK_STYLE = {
  bg: 'bg-muted',
  text: 'text-muted-foreground',
  badge: 'bg-muted text-muted-foreground',
};

// ─────────────────────────────────────────────────────────────────
// Favorites storage
// ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'medref_favorit';

function readFavorites(): { itemId: string; type: string }[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function writeFavorites(favorites: unknown[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

// ─────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────

/** Pill-shaped action button — always visible, touch-friendly */
function ActionButton({
  onClick,
  title,
  active,
  children,
}: {
  onClick: (e: React.MouseEvent) => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={cn(
        'flex items-center justify-center rounded-full',
        'h-8 w-8 touch-target',
        'transition-colors duration-150',
        'text-muted-foreground hover:text-foreground',
        'hover:bg-muted focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring focus-visible:ring-offset-1',
        active && 'text-[color:var(--danger)] hover:text-[color:var(--danger)]'
      )}
    >
      {children}
    </button>
  );
}

/** Warning badge — used for interactions and contraindications */
function SafetyBadge({
  count,
  variant,
}: {
  count: number;
  variant: 'interaction' | 'contraindication';
}) {
  if (count === 0) return null;

  const isInteraction = variant === 'interaction';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
        'text-[10px] font-semibold leading-none',
        'motion-safe:animate-[badgePop_0.3s_ease-out_both]',
        isInteraction
          ? 'bg-[var(--warning-subtle)] text-[color:var(--warning-subtle-foreground)] ring-1 ring-inset ring-[var(--warning-border)]'
          : 'bg-[var(--danger-subtle)] text-[color:var(--danger-subtle-foreground)] ring-1 ring-inset ring-[var(--danger-border)]'
      )}
      role="status"
      aria-label={
        isInteraction
          ? `${count} interaksi obat`
          : `${count} kontraindikasi`
      }
    >
      {isInteraction ? (
        <AlertTriangle className="h-2.5 w-2.5" aria-hidden />
      ) : (
        <ShieldX className="h-2.5 w-2.5" aria-hidden />
      )}
      <span className="font-numeric tabular-nums">{count}</span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────

export function DrugCard({ drug, showInteractions = true }: DrugCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  // Hydrate favorite state from localStorage
  useEffect(() => {
    const favorites = readFavorites();
    setIsFavorite(
      favorites.some((f) => f.itemId === drug.id && f.type === 'drug')
    );
  }, [drug.id]);

  // ── Handlers ────────────────────────────────────────────────────

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const favorites = readFavorites();

      if (isFavorite) {
        writeFavorites(
          favorites.filter(
            (f) => !(f.itemId === drug.id && f.type === 'drug')
          )
        );
        setIsFavorite(false);
        toast.success('Dihapus dari favorit', { description: drug.name });
      } else {
        writeFavorites([
          ...favorites,
          {
            id: `fav-${Date.now()}`,
            type: 'drug',
            itemId: drug.id,
            name: drug.name,
            description:
              drug.genericName ||
              drug.description?.slice(0, 50) ||
              drug.drugClass,
            category: drug.category || drug.drugClass,
            addedAt: new Date().toISOString(),
          },
        ]);
        setIsFavorite(true);
        toast.success('Ditambahkan ke favorit', { description: drug.name });
      }
    } catch {
      toast.error('Gagal memperbarui favorit', { description: 'Coba lagi nanti' });
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/drugs/${drug.id}`;
    const text = `${drug.name}${drug.genericName ? ` (${drug.genericName})` : ''} — ${
      drug.description?.slice(0, 100) || drug.drugClass || 'Info obat'
    } di MedRef`;

    if (navigator.share) {
      try {
        await navigator.share({ title: drug.name, text, url });
        toast.success('Berhasil membagikan', { description: drug.name });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link disalin ke clipboard', {
        description: `Link ${drug.name} berhasil disalin`,
      });
    } catch {
      toast.error('Gagal menyalin link', {
        description: 'Silakan salin secara manual',
      });
    }
  };

  // ── Derived values ───────────────────────────────────────────────

  const interactionsCount = drug._count?.interactions ?? 0;
  const contraindicationsCount = drug._count?.contraindications ?? 0;
  const hasSafetyWarnings =
    showInteractions && (interactionsCount > 0 || contraindicationsCount > 0);

  const categoryKey = normalizeCategory(drug.category || drug.drugClass);
  const style = categoryStyles[categoryKey] ?? FALLBACK_STYLE;
  const categoryLabel = drug.category || drug.drugClass;

  // Show max 2 indications inline
  const indicationList = drug.indications?.slice(0, 2) ?? [];
  const hasMoreIndications = (drug.indications?.length ?? 0) > 2;

  // ── Render ───────────────────────────────────────────────────────

  return (
    <Link
      href={`/drugs/${drug.id}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
    >
      <article
        className={cn(
          'relative flex flex-col rounded-xl border bg-card',
          'transition-all duration-200',
          'motion-safe:hover:-translate-y-0.5',
          'hover:shadow-md hover:border-primary/25',
          'active:scale-[0.98] active:shadow-sm',
          'h-full overflow-hidden',
          'motion-safe:animate-[fadeSlideIn_0.35s_ease-out_both]'
        )}
      >
        {/* Safety warning stripe */}
        {hasSafetyWarnings && (
          <div
            className={cn(
              'h-0.5 w-full',
              contraindicationsCount > 0
                ? 'bg-[color:var(--danger)]'
                : 'bg-[color:var(--warning)]'
            )}
            aria-hidden
          />
        )}

        <div className="p-3 sm:p-4 flex flex-col gap-2.5 h-full">
          {/* Row 1: Icon + Name + Actions */}
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex-shrink-0 flex items-center justify-center',
                'h-9 w-9 sm:h-10 sm:w-10 rounded-xl',
                'transition-transform duration-200',
                'motion-safe:group-hover:scale-105',
                style.bg
              )}
              aria-hidden
            >
              <Pill className={cn('h-4 w-4 sm:h-5 sm:w-5', style.text)} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base leading-snug truncate">
                {drug.name}
              </h3>
              {drug.genericName && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {drug.genericName}
                </p>
              )}
            </div>

            <div className="flex items-center gap-0.5 flex-shrink-0 -mr-1 -mt-0.5">
              <ActionButton onClick={handleShare} title="Bagikan">
                <Share2 className="h-3.5 w-3.5" />
              </ActionButton>
              <ActionButton
                onClick={toggleFavorite}
                title={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
                active={isFavorite}
              >
                <Heart
                  className={cn(
                    'h-3.5 w-3.5 transition-all duration-150',
                    isFavorite && 'fill-[color:var(--danger)]'
                  )}
                />
              </ActionButton>
              <ChevronRight
                className={cn(
                  'h-4 w-4 text-muted-foreground/30 ml-0.5',
                  'transition-transform duration-200',
                  'motion-safe:group-hover:translate-x-0.5 group-hover:text-muted-foreground/50'
                )}
                aria-hidden
              />
            </div>
          </div>

          {/* Row 2: Category badge */}
          {categoryLabel && (
            <div>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5',
                  'text-[10px] sm:text-xs font-medium capitalize',
                  'ring-1 ring-inset ring-current/15',
                  style.badge
                )}
              >
                {categoryLabel}
              </span>
            </div>
          )}

          {/* Row 3: Description */}
          {drug.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {drug.description}
            </p>
          )}

          {/* Row 4: Indications */}
          {indicationList.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {indicationList.map((ind, i) => (
                <span
                  key={i}
                  className="inline-block text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5 leading-none"
                >
                  {ind.indication}
                </span>
              ))}
              {hasMoreIndications && (
                <span className="inline-block text-[10px] text-muted-foreground/60 leading-none px-0.5 py-0.5">
                  +{(drug.indications?.length ?? 0) - 2} lainnya
                </span>
              )}
            </div>
          )}

          {/* Row 5: Safety warnings */}
          {hasSafetyWarnings && (
            <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-border/50">
              <span className="text-[10px] text-muted-foreground mr-0.5">
                Peringatan:
              </span>
              <SafetyBadge count={interactionsCount} variant="interaction" />
              <SafetyBadge
                count={contraindicationsCount}
                variant="contraindication"
              />
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}