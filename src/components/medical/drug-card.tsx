'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Heart,
  AlertTriangle,
  ShieldX,
  Share2,
  Pill,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Drug } from '@prisma/client';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────
// Category Normalization
// ─────────────────────────────────────────────────────────

function normalizeCategory(cat?: string | null): string {
  if (!cat) return 'general';
  const normalized = cat.toLowerCase().trim();

  const mapping: Record<string, string> = {
    antibiotik: 'antibiotic',
    kardiovaskular: 'cardiovascular',
    respirasi: 'respiratory',
    neurologi: 'neurology',
    psikiatri: 'psychiatry',
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

// ─────────────────────────────────────────────────────────
// Category Color Map
// ─────────────────────────────────────────────────────────

const categoryStyles: Record<string, { badge: string; stripe: string }> = {
  analgesic: {
    badge: 'bg-[var(--cat-analgesic-subtle)] text-[color:var(--cat-analgesic)]',
    stripe: 'bg-[color:var(--cat-analgesic)]',
  },
  antibiotic: {
    badge: 'bg-[var(--cat-antibiotic-subtle)] text-[color:var(--cat-antibiotic)]',
    stripe: 'bg-[color:var(--cat-antibiotic)]',
  },
  antiviral: {
    badge: 'bg-[var(--cat-antiviral-subtle)] text-[color:var(--cat-antiviral)]',
    stripe: 'bg-[color:var(--cat-antiviral)]',
  },
  antifungal: {
    badge: 'bg-[var(--cat-antifungal-subtle)] text-[color:var(--cat-antifungal)]',
    stripe: 'bg-[color:var(--cat-antifungal)]',
  },
  cardiovascular: {
    badge: 'bg-[var(--cat-cardiovascular-subtle)] text-[color:var(--cat-cardiovascular)]',
    stripe: 'bg-[color:var(--cat-cardiovascular)]',
  },
  respiratory: {
    badge: 'bg-[var(--cat-respiratory-subtle)] text-[color:var(--cat-respiratory)]',
    stripe: 'bg-[color:var(--cat-respiratory)]',
  },
  gastrointestinal: {
    badge: 'bg-[var(--cat-gastrointestinal-subtle)] text-[color:var(--cat-gastrointestinal)]',
    stripe: 'bg-[color:var(--cat-gastrointestinal)]',
  },
  neurology: {
    badge: 'bg-[var(--cat-neurology-subtle)] text-[color:var(--cat-neurology)]',
    stripe: 'bg-[color:var(--cat-neurology)]',
  },
  antidiabetic: {
    badge: 'bg-[var(--cat-antidiabetic-subtle)] text-[color:var(--cat-antidiabetic)]',
    stripe: 'bg-[color:var(--cat-antidiabetic)]',
  },
  general: {
    badge: 'bg-[var(--cat-general-subtle)] text-[color:var(--cat-general)]',
    stripe: 'bg-[color:var(--cat-general)]',
  },
  psychiatry: {
    badge: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    stripe: 'bg-violet-500',
  },
  endocrine: {
    badge: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    stripe: 'bg-purple-500',
  },
};

const FALLBACK_STYLE = {
  badge: 'bg-muted text-muted-foreground',
  stripe: 'bg-primary',
};

// ─────────────────────────────────────────────────────────
// Favorites Storage
// ─────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────

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
  const label = isInteraction ? 'interaksi' : 'kontraindikasi';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
        'text-[11px] font-semibold leading-tight',
        'ring-1 ring-inset',
        isInteraction
          ? 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-700/50'
          : 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-700/50'
      )}
      role="status"
      aria-label={`${count} ${label}`}
    >
      {isInteraction ? (
        <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden />
      ) : (
        <ShieldX className="h-3 w-3 shrink-0" aria-hidden />
      )}
      <span className="font-numeric tabular-nums">{count}</span>
      <span className="text-[10px] font-medium opacity-80">{label}</span>
    </span>
  );
}

/** Compact action button */
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
        'flex items-center justify-center rounded-lg',
        'h-7 w-7',
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

// ─────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────

export function DrugCard({ drug, showInteractions = true }: DrugCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favorites = readFavorites();
    setIsFavorite(
      favorites.some((f) => f.itemId === drug.id && f.type === 'drug')
    );
  }, [drug.id]);

  // ── Handlers ────────────────────────────────────────────────

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

    if (navigator.share) {
      try {
        await navigator.share({ title: drug.name, url });
        toast.success('Berhasil membagikan', { description: drug.name });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }

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

  // ── Derived values ─────────────────────────────────────────────

  const interactionsCount = drug._count?.interactions ?? 0;
  const contraindicationsCount = drug._count?.contraindications ?? 0;
  const hasWarnings =
    showInteractions && (interactionsCount > 0 || contraindicationsCount > 0);

  const categoryKey = normalizeCategory(drug.category || drug.drugClass);
  const style = categoryStyles[categoryKey] ?? FALLBACK_STYLE;
  const categoryLabel = drug.category || drug.drugClass;

  // Primary indication for preview
  const primaryIndication = drug.indications?.[0]?.indication;

  return (
    <Link
      href={`/drugs/${drug.id}`}
      className={cn(
        'group block rounded-xl',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-background'
      )}
    >
      <article
        className={cn(
          'relative flex flex-col rounded-xl border bg-card',
          'min-h-[120px]',
          'transition-all duration-200 ease-out',
          'motion-safe:hover:-translate-y-0.5',
          'hover:shadow-md hover:border-primary/20',
          'active:scale-[0.985] active:translate-y-0',
          'overflow-hidden'
        )}
      >
        {/* Category color stripe - always visible */}
        <div
          className={cn('h-[3px] w-full shrink-0', style.stripe)}
          aria-hidden
        />

        <div className="flex flex-col h-full p-4">
          {/* ═══════════════════════════════════════════════════
              HEADER: Icon + Name + Generic + Actions
              Drug name is visually dominant with pill icon.
              Generic name is secondary but always visible.
              Actions on the right side.
          ═══════════════════════════════════════════════════ */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {/* Drug name with icon — dominant */}
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                <h3 className="font-bold text-base sm:text-lg leading-tight text-foreground truncate">
                  {drug.name}
                </h3>
              </div>

              {/* Generic name — secondary */}
              {drug.genericName && (
                <p className="text-sm text-muted-foreground italic truncate mt-0.5 pl-6">
                  {drug.genericName}
                </p>
              )}

              {/* Category pill */}
              {categoryLabel && (
                <span
                  className={cn(
                    'inline-flex items-center mt-1.5 ml-6 px-2 py-0.5 rounded-full',
                    'text-[11px] font-medium capitalize',
                    style.badge
                  )}
                >
                  {categoryLabel}
                </span>
              )}
            </div>

            {/* Actions — visible on hover */}
            <div
              className={cn(
                'flex items-center gap-0.5 shrink-0',
                'opacity-0 group-hover:opacity-100',
                'transition-opacity duration-200'
              )}
            >
              <ActionButton onClick={handleShare} title="Bagikan">
                <Share2 className="h-4 w-4" />
              </ActionButton>
              <ActionButton
                onClick={toggleFavorite}
                title={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
                active={isFavorite}
              >
                <Heart
                  className={cn(
                    'h-4 w-4',
                    isFavorite && 'fill-[color:var(--danger)]'
                  )}
                />
              </ActionButton>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              BODY: Description / Indication preview
              More prominent description area.
          ═══════════════════════════════════════════════════ */}
          {(drug.description || primaryIndication) && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2 pl-6">
              {drug.description || primaryIndication}
            </p>
          )}

          {/* ═══════════════════════════════════════════════════
              FOOTER: Warnings section
              Shows "Peringatan:" label with safety badges.
          ═══════════════════════════════════════════════════ */}
          <div className="mt-auto pt-3">
            {hasWarnings ? (
              <div className="flex flex-wrap items-center gap-1.5 pl-6">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <AlertCircle className="h-3 w-3" />
                  Peringatan:
                </span>
                <SafetyBadge
                  count={interactionsCount}
                  variant="interaction"
                />
                <SafetyBadge
                  count={contraindicationsCount}
                  variant="contraindication"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between pl-6">
                <span className="text-[11px] text-muted-foreground/50">
                  Lihat detail →
                </span>
                <ChevronRight
                  className={cn(
                    'h-4 w-4 shrink-0',
                    'text-muted-foreground/25',
                    'transition-colors duration-200',
                    'group-hover:text-muted-foreground/50'
                  )}
                  aria-hidden
                />
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
