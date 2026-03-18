// /src/components/medical/drug-card.tsx
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Drug } from '@prisma/client';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

type DrugWithRelations = Drug & {
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
// Category color map
// Setiap entry: [iconBg, iconText, badgeBg, badgeText]
// Dipisah supaya icon container dan badge punya style berbeda
// ─────────────────────────────────────────────────────────────────

type CategoryColors = {
  iconBg: string;
  iconText: string;
  badge: string;
  stripe: string;
};

const FALLBACK_COLORS: CategoryColors = {
  iconBg: 'bg-slate-100 dark:bg-slate-800/60',
  iconText: 'text-slate-500 dark:text-slate-400',
  badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  stripe: 'bg-slate-300 dark:bg-slate-600',
};

const warnaKategori: Record<string, CategoryColors> = {
  analgesic: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconText: 'text-emerald-600 dark:text-emerald-300',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    stripe: 'bg-emerald-400 dark:bg-emerald-500',
  },
  antibiotic: {
    iconBg: 'bg-rose-100 dark:bg-rose-900/40',
    iconText: 'text-rose-600 dark:text-rose-300',
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    stripe: 'bg-rose-400 dark:bg-rose-500',
  },
  antibiotik: {
    iconBg: 'bg-rose-100 dark:bg-rose-900/40',
    iconText: 'text-rose-600 dark:text-rose-300',
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    stripe: 'bg-rose-400 dark:bg-rose-500',
  },
  antiviral: {
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconText: 'text-violet-600 dark:text-violet-300',
    badge: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    stripe: 'bg-violet-400 dark:bg-violet-500',
  },
  antifungal: {
    iconBg: 'bg-orange-100 dark:bg-orange-900/40',
    iconText: 'text-orange-600 dark:text-orange-300',
    badge: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    stripe: 'bg-orange-400 dark:bg-orange-500',
  },
  antihypertensive: {
    iconBg: 'bg-pink-100 dark:bg-pink-900/40',
    iconText: 'text-pink-600 dark:text-pink-300',
    badge: 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    stripe: 'bg-pink-400 dark:bg-pink-500',
  },
  cardiovascular: {
    iconBg: 'bg-pink-100 dark:bg-pink-900/40',
    iconText: 'text-pink-600 dark:text-pink-300',
    badge: 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    stripe: 'bg-pink-400 dark:bg-pink-500',
  },
  kardiovaskular: {
    iconBg: 'bg-pink-100 dark:bg-pink-900/40',
    iconText: 'text-pink-600 dark:text-pink-300',
    badge: 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    stripe: 'bg-pink-400 dark:bg-pink-500',
  },
  respiratory: {
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/40',
    iconText: 'text-cyan-600 dark:text-cyan-300',
    badge: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    stripe: 'bg-cyan-400 dark:bg-cyan-500',
  },
  respirasi: {
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/40',
    iconText: 'text-cyan-600 dark:text-cyan-300',
    badge: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    stripe: 'bg-cyan-400 dark:bg-cyan-500',
  },
  gastrointestinal: {
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconText: 'text-amber-600 dark:text-amber-300',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    stripe: 'bg-amber-400 dark:bg-amber-500',
  },
  neurology: {
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
    iconText: 'text-indigo-600 dark:text-indigo-300',
    badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    stripe: 'bg-indigo-400 dark:bg-indigo-500',
  },
  neurologi: {
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
    iconText: 'text-indigo-600 dark:text-indigo-300',
    badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    stripe: 'bg-indigo-400 dark:bg-indigo-500',
  },
  psychiatry: {
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconText: 'text-violet-600 dark:text-violet-300',
    badge: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    stripe: 'bg-violet-400 dark:bg-violet-500',
  },
  psikiatri: {
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconText: 'text-violet-600 dark:text-violet-300',
    badge: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    stripe: 'bg-violet-400 dark:bg-violet-500',
  },
  antidiabetic: {
    iconBg: 'bg-sky-100 dark:bg-sky-900/40',
    iconText: 'text-sky-600 dark:text-sky-300',
    badge: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    stripe: 'bg-sky-400 dark:bg-sky-500',
  },
  endocrine: {
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    iconText: 'text-purple-600 dark:text-purple-300',
    badge: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    stripe: 'bg-purple-400 dark:bg-purple-500',
  },
  hormonal: {
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    iconText: 'text-purple-600 dark:text-purple-300',
    badge: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    stripe: 'bg-purple-400 dark:bg-purple-500',
  },
  diuretic: {
    iconBg: 'bg-teal-100 dark:bg-teal-900/40',
    iconText: 'text-teal-600 dark:text-teal-300',
    badge: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    stripe: 'bg-teal-400 dark:bg-teal-500',
  },
  anticoagulant: {
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    iconText: 'text-red-600 dark:text-red-300',
    badge: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    stripe: 'bg-red-400 dark:bg-red-500',
  },
  antiarrhythmic: {
    iconBg: 'bg-pink-100 dark:bg-pink-900/40',
    iconText: 'text-pink-600 dark:text-pink-300',
    badge: 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    stripe: 'bg-pink-400 dark:bg-pink-500',
  },
  'lipid-lowering': {
    iconBg: 'bg-orange-100 dark:bg-orange-900/40',
    iconText: 'text-orange-600 dark:text-orange-300',
    badge: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    stripe: 'bg-orange-400 dark:bg-orange-500',
  },
  antianginal: {
    iconBg: 'bg-pink-100 dark:bg-pink-900/40',
    iconText: 'text-pink-600 dark:text-pink-300',
    badge: 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    stripe: 'bg-pink-400 dark:bg-pink-500',
  },
  antimigraine: {
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
    iconText: 'text-indigo-600 dark:text-indigo-300',
    badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    stripe: 'bg-indigo-400 dark:bg-indigo-500',
  },
  antigout: {
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconText: 'text-amber-600 dark:text-amber-300',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    stripe: 'bg-amber-400 dark:bg-amber-500',
  },
  antihistamine: {
    iconBg: 'bg-sky-100 dark:bg-sky-900/40',
    iconText: 'text-sky-600 dark:text-sky-300',
    badge: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    stripe: 'bg-sky-400 dark:bg-sky-500',
  },
  antiemetic: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconText: 'text-emerald-600 dark:text-emerald-300',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    stripe: 'bg-emerald-400 dark:bg-emerald-500',
  },
  laxative: {
    iconBg: 'bg-lime-100 dark:bg-lime-900/40',
    iconText: 'text-lime-600 dark:text-lime-300',
    badge: 'bg-lime-50 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300',
    stripe: 'bg-lime-400 dark:bg-lime-500',
  },
  thyroid: {
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    iconText: 'text-purple-600 dark:text-purple-300',
    badge: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    stripe: 'bg-purple-400 dark:bg-purple-500',
  },
  corticosteroid: {
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconText: 'text-amber-600 dark:text-amber-300',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    stripe: 'bg-amber-400 dark:bg-amber-500',
  },
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
        active && 'text-rose-500 hover:text-rose-600',
      )}
    >
      {children}
    </button>
  );
}

/** Warning pill — used for interactions and contraindications */
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
        'text-[10px] font-semibold leading-none ring-1 ring-inset',
        isInteraction
          ? 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-700/50'
          : 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-700/50',
      )}
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
      <span className="font-numeric">{count}</span>
      <span>{isInteraction ? 'interaksi' : 'kontraindikasi'}</span>
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
      favorites.some((f) => f.itemId === drug.id && f.type === 'drug'),
    );
  }, [drug.id]);

  // ── Handlers ────────────────────────────────────────────────────

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const favorites = readFavorites();

    if (isFavorite) {
      writeFavorites(
        favorites.filter(
          (f) => !(f.itemId === drug.id && f.type === 'drug'),
        ),
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

  const categoryKey = (drug.category || drug.drugClass || '').toLowerCase();
  const colors = warnaKategori[categoryKey] ?? FALLBACK_COLORS;
  const categoryLabel = drug.category || drug.drugClass;

  // Show max 2 indications inline — detail page shows the rest
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
          'hover:-translate-y-0.5 hover:shadow-md hover:border-primary/25',
          'active:scale-[0.98] active:shadow-sm',
          'h-full overflow-hidden',
        )}
      >
        {/* Category color stripe — always visible as visual accent */}
        <div
          className={cn('h-0.5 w-full', colors.stripe)}
          aria-hidden
        />

        <div className="p-3 sm:p-4 flex flex-col gap-2.5 h-full">
          {/* ── Row 1: Icon + Name + Actions ─────────────────────── */}
          <div className="flex items-start gap-3">
            {/* Category-colored icon */}
            <div
              className={cn(
                'flex-shrink-0 flex items-center justify-center',
                'h-9 w-9 sm:h-10 sm:w-10 rounded-xl',
                'transition-transform duration-200 group-hover:scale-105',
                colors.iconBg,
              )}
              aria-hidden
            >
              <Pill className={cn('h-4 w-4 sm:h-5 sm:w-5', colors.iconText)} />
            </div>

            {/* Drug name + generic name */}
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

            {/*
             * Action buttons: always visible on mobile (no hover needed).
             * On desktop they're always visible too — simpler and more
             * accessible than opacity-0 hover reveal.
             */}
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
                    isFavorite && 'fill-rose-500',
                  )}
                />
              </ActionButton>
              <ChevronRight
                className={cn(
                  'h-4 w-4 text-muted-foreground/30 ml-0.5',
                  'transition-transform duration-200',
                  'group-hover:translate-x-0.5 group-hover:text-muted-foreground/50',
                )}
                aria-hidden
              />
            </div>
          </div>

          {/* ── Row 2: Category badge ────────────────────────────── */}
          {categoryLabel && (
            <div>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5',
                  'text-[10px] sm:text-xs font-medium capitalize',
                  'ring-1 ring-inset ring-current/15',
                  colors.badge,
                )}
              >
                {categoryLabel}
              </span>
            </div>
          )}

          {/* ── Row 3: Description ───────────────────────────────── */}
          {drug.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {drug.description}
            </p>
          )}

          {/* ── Row 4: Indications ───────────────────────────────── */}
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

          {/*
           * ── Row 5: Safety warnings ───────────────────────────────
           * Pushed to bottom with mt-auto so they sit at the card
           * bottom regardless of how much content is above.
           * This creates visual consistency across cards in a grid.
           */}
          {hasSafetyWarnings && (
            <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-border/50">
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
