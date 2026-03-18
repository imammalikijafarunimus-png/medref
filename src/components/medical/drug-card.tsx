'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Heart,
  AlertTriangle,
  ShieldX,
  Share2,
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

const categoryStyles: Record<string, { badge: string }> = {
  analgesic: {
    badge: 'bg-[var(--cat-analgesic-subtle)] text-[color:var(--cat-analgesic)]',
  },
  antibiotic: {
    badge: 'bg-[var(--cat-antibiotic-subtle)] text-[color:var(--cat-antibiotic)]',
  },
  antiviral: {
    badge: 'bg-[var(--cat-antiviral-subtle)] text-[color:var(--cat-antiviral)]',
  },
  antifungal: {
    badge: 'bg-[var(--cat-antifungal-subtle)] text-[color:var(--cat-antifungal)]',
  },
  cardiovascular: {
    badge: 'bg-[var(--cat-cardiovascular-subtle)] text-[color:var(--cat-cardiovascular)]',
  },
  respiratory: {
    badge: 'bg-[var(--cat-respiratory-subtle)] text-[color:var(--cat-respiratory)]',
  },
  gastrointestinal: {
    badge: 'bg-[var(--cat-gastrointestinal-subtle)] text-[color:var(--cat-gastrointestinal)]',
  },
  neurology: {
    badge: 'bg-[var(--cat-neurology-subtle)] text-[color:var(--cat-neurology)]',
  },
  antidiabetic: {
    badge: 'bg-[var(--cat-antidiabetic-subtle)] text-[color:var(--cat-antidiabetic)]',
  },
  general: {
    badge: 'bg-[var(--cat-general-subtle)] text-[color:var(--cat-general)]',
  },
  psychiatry: {
    badge: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  },
  endocrine: {
    badge: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  },
};

const FALLBACK_STYLE = {
  badge: 'bg-muted text-muted-foreground',
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

/** Warning badge — compact, informative */
function WarningBadge({
  count,
  type,
}: {
  count: number;
  type: 'interaction' | 'contraindication';
}) {
  if (count === 0) return null;

  const isContraindication = type === 'contraindication';
  const Icon = isContraindication ? ShieldX : AlertTriangle;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
        'text-[11px] font-medium',
        isContraindication
          ? 'bg-[var(--danger-subtle)] text-[color:var(--danger-subtle-foreground)]'
          : 'bg-[var(--warning-subtle)] text-[color:var(--warning-subtle-foreground)]'
      )}
      role="status"
      aria-label={
        isContraindication
          ? `${count} kontraindikasi`
          : `${count} interaksi obat`
      }
    >
      <Icon className="h-3 w-3" aria-hidden />
      <span className="tabular-nums">{count}</span>
    </span>
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
        {/* Safety warning stripe */}
        {hasWarnings && (
          <div
            className={cn(
              'h-[3px] w-full shrink-0',
              contraindicationsCount > 0
                ? 'bg-[color:var(--danger)]'
                : 'bg-[color:var(--warning)]'
            )}
            aria-hidden
          />
        )}

        <div className="flex flex-col h-full p-4">
          {/* ═══════════════════════════════════════════════════
              HEADER: Name + Generic + Category
              Drug name is visually dominant.
              Generic name is secondary but always visible.
              Category is a subtle pill badge.
          ═══════════════════════════════════════════════════ */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {/* Drug name — dominant */}
              <h3 className="font-bold text-base sm:text-lg leading-tight text-foreground truncate">
                {drug.name}
              </h3>

              {/* Generic name — secondary */}
              {drug.genericName && (
                <p className="text-sm text-muted-foreground italic truncate mt-0.5">
                  {drug.genericName}
                </p>
              )}

              {/* Category pill */}
              {categoryLabel && (
                <span
                  className={cn(
                    'inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full',
                    'text-[11px] font-medium capitalize',
                    style.badge
                  )}
                >
                  {categoryLabel}
                </span>
              )}
            </div>

            {/* Chevron — navigation affordance */}
            <ChevronRight
              className={cn(
                'h-5 w-5 mt-1 shrink-0',
                'text-muted-foreground/25',
                'transition-colors duration-200',
                'group-hover:text-muted-foreground/50'
              )}
              aria-hidden
            />
          </div>

          {/* ═══════════════════════════════════════════════════
              BODY: Indication preview
              Single line for quick scanning.
          ═══════════════════════════════════════════════════ */}
          {primaryIndication && (
            <p className="mt-2 text-xs text-muted-foreground line-clamp-1">
              {primaryIndication}
            </p>
          )}

          {/* ═══════════════════════════════════════════════════
              FOOTER: Warnings + Actions
              Warnings visible, actions on hover.
          ═══════════════════════════════════════════════════ */}
          <div className="mt-auto pt-3 flex items-center justify-between">
            {/* Warnings */}
            {hasWarnings ? (
              <div className="flex items-center gap-1.5">
                <WarningBadge count={interactionsCount} type="interaction" />
                <WarningBadge count={contraindicationsCount} type="contraindication" />
              </div>
            ) : (
              <span className="text-[11px] text-muted-foreground/50">
                Lihat detail →
              </span>
            )}

            {/* Actions — appear on hover for cleaner default state */}
            <div
              className={cn(
                'flex items-center gap-0.5',
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
        </div>
      </article>
    </Link>
  );
}