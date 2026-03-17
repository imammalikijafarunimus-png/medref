// /src/components/medical/herbal-card.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Leaf,
  ChevronRight,
  Heart,
  FlaskConical,
  AlertTriangle,
  Share2,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

interface HerbalCardProps {
  herbal: {
    id: string;
    name: string;
    latinName: string | null;
    commonNames?: string | null;
    localNames?: string | null;
    category?: string | null;
    safetyRating: string | null;
    plantPart?: string | null;
    preparation?: string | null;
    regulatoryStatus?: string | null;
    indications?: { indication: string; evidenceLevel?: string | null }[];
    compounds?: { compoundName: string }[];
    interactions?: { id: string }[];
  };
}

// ─────────────────────────────────────────────────────────────────
// Safety rating config
// Centralised: color stripe + icon + badge + icon-bg all in one place
// ─────────────────────────────────────────────────────────────────

type SafetyConfig = {
  /** Top border stripe color */
  stripe: string;
  /** Icon container background */
  iconBg: string;
  /** Icon color */
  iconText: string;
  /** Safety badge pill */
  badge: string;
  /** Lucide icon component */
  Icon: React.ComponentType<{ className?: string }>;
  /** Human-readable label fallback */
  label: string;
};

const SAFETY_CONFIG: Record<string, SafetyConfig> = {
  aman: {
    stripe: 'bg-emerald-400 dark:bg-emerald-500',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconText: 'text-emerald-600 dark:text-emerald-300',
    badge:
      'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-700/50',
    Icon: CheckCircle2,
    label: 'Aman',
  },
  safe: {
    stripe: 'bg-emerald-400 dark:bg-emerald-500',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconText: 'text-emerald-600 dark:text-emerald-300',
    badge:
      'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-700/50',
    Icon: CheckCircle2,
    label: 'Aman',
  },
  'hati-hati': {
    stripe: 'bg-amber-400 dark:bg-amber-500',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconText: 'text-amber-600 dark:text-amber-300',
    badge:
      'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-700/50',
    Icon: AlertCircle,
    label: 'Hati-hati',
  },
  caution: {
    stripe: 'bg-amber-400 dark:bg-amber-500',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconText: 'text-amber-600 dark:text-amber-300',
    badge:
      'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-700/50',
    Icon: AlertCircle,
    label: 'Hati-hati',
  },
  'tidak aman': {
    stripe: 'bg-rose-400 dark:bg-rose-500',
    iconBg: 'bg-rose-100 dark:bg-rose-900/40',
    iconText: 'text-rose-600 dark:text-rose-300',
    badge:
      'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-700/50',
    Icon: XCircle,
    label: 'Tidak Aman',
  },
  'tidak-aman': {
    stripe: 'bg-rose-400 dark:bg-rose-500',
    iconBg: 'bg-rose-100 dark:bg-rose-900/40',
    iconText: 'text-rose-600 dark:text-rose-300',
    badge:
      'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-700/50',
    Icon: XCircle,
    label: 'Tidak Aman',
  },
  unsafe: {
    stripe: 'bg-rose-400 dark:bg-rose-500',
    iconBg: 'bg-rose-100 dark:bg-rose-900/40',
    iconText: 'text-rose-600 dark:text-rose-300',
    badge:
      'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-700/50',
    Icon: XCircle,
    label: 'Tidak Aman',
  },
};

const SAFETY_FALLBACK: SafetyConfig = {
  stripe: 'bg-slate-300 dark:bg-slate-600',
  iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
  iconText: 'text-emerald-600 dark:text-emerald-300',
  badge:
    'bg-slate-50 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700/50',
  Icon: Leaf,
  label: 'Herbal',
};

// ─────────────────────────────────────────────────────────────────
// Evidence level config
// Visual weight maps to evidence strength:
// Kuat = solid fill, Moderat = soft fill, Lemah = outline, Tradisional = muted italic
// ─────────────────────────────────────────────────────────────────

type EvidenceStyle = {
  className: string;
  label: string;
};

const EVIDENCE_STYLES: Record<string, EvidenceStyle> = {
  kuat: {
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold',
    label: 'Kuat',
  },
  strong: {
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold',
    label: 'Kuat',
  },
  moderat: {
    className:
      'bg-sky-50 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:ring-sky-700/50',
    label: 'Moderat',
  },
  moderate: {
    className:
      'bg-sky-50 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:ring-sky-700/50',
    label: 'Moderat',
  },
  lemah: {
    className:
      'text-amber-600 ring-1 ring-amber-300 dark:text-amber-400 dark:ring-amber-600/50',
    label: 'Lemah',
  },
  weak: {
    className:
      'text-amber-600 ring-1 ring-amber-300 dark:text-amber-400 dark:ring-amber-600/50',
    label: 'Lemah',
  },
  tradisional: {
    className:
      'text-violet-500 ring-1 ring-violet-200 italic dark:text-violet-400 dark:ring-violet-600/50',
    label: 'Tradisional',
  },
  traditional: {
    className:
      'text-violet-500 ring-1 ring-violet-200 italic dark:text-violet-400 dark:ring-violet-600/50',
    label: 'Tradisional',
  },
};

// ─────────────────────────────────────────────────────────────────
// Category labels (ID)
// ─────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  digestive: 'Pencernaan',
  immunity: 'Imunitas',
  antiinflammatory: 'Antiinflamasi',
  respiratory: 'Respirasi',
  nervous: 'Saraf',
  cardiovascular: 'Kardiovaskular',
  metabolic: 'Metabolik',
  'skin-topical': 'Kulit/Topikal',
  urinary: 'Urinari',
  reproductive: 'Reproduksi',
  analgesic: 'Analgesik',
};

// ─────────────────────────────────────────────────────────────────
// Favorites storage helpers (shared pattern with DrugCard)
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
// Utilities
// ─────────────────────────────────────────────────────────────────

function parseNames(str: string | null): string[] {
  if (!str) return [];
  if (str.startsWith('[')) {
    try {
      return JSON.parse(str);
    } catch {
      /* fall through */
    }
  }
  return str.split(',').map((s) => s.trim()).filter(Boolean);
}

function getFirstCommonName(commonNames: string | null | undefined): string | null {
  const names = parseNames(commonNames ?? null);
  return names[0] ?? null;
}

// ─────────────────────────────────────────────────────────────────
// Sub-components (same pattern as DrugCard)
// ─────────────────────────────────────────────────────────────────

/** Reusable touch-friendly icon button */
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
        'h-8 w-8',
        'transition-colors duration-150',
        'text-muted-foreground hover:text-foreground hover:bg-muted',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring focus-visible:ring-offset-1',
        active && 'text-rose-500 hover:text-rose-600',
      )}
    >
      {children}
    </button>
  );
}

/**
 * Evidence level badge.
 * Visual weight mirrors evidence strength so clinicians can triage at a glance:
 * Kuat = filled, Moderat = soft fill + ring, Lemah = ring only, Tradisional = italic ring
 */
function EvidenceBadge({ level }: { level: string }) {
  const key = level.toLowerCase();
  const style = EVIDENCE_STYLES[key];
  if (!style) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5',
        'text-[9px] leading-none',
        style.className,
      )}
      aria-label={`Tingkat bukti: ${style.label}`}
    >
      {style.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────

export function HerbalCard({ herbal }: HerbalCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favorites = readFavorites();
    setIsFavorite(
      favorites.some((f) => f.itemId === herbal.id && f.type === 'herbal'),
    );
  }, [herbal.id]);

  // ── Handlers ────────────────────────────────────────────────────

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const favorites = readFavorites();

    if (isFavorite) {
      writeFavorites(
        favorites.filter(
          (f) => !(f.itemId === herbal.id && f.type === 'herbal'),
        ),
      );
      setIsFavorite(false);
      toast.success('Dihapus dari favorit', { description: herbal.name });
    } else {
      writeFavorites([
        ...favorites,
        {
          id: `fav-${Date.now()}`,
          type: 'herbal',
          itemId: herbal.id,
          name: herbal.name,
          description: herbal.latinName,
          category: herbal.category,
          addedAt: new Date().toISOString(),
        },
      ]);
      setIsFavorite(true);
      toast.success('Ditambahkan ke favorit', { description: herbal.name });
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/herbals/${herbal.id}`;
    const text = `${herbal.name}${herbal.latinName ? ` (${herbal.latinName})` : ''} — Obat herbal di MedRef`;

    if (navigator.share) {
      try {
        await navigator.share({ title: herbal.name, text, url });
        toast.success('Berhasil membagikan', { description: herbal.name });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link disalin ke clipboard', {
        description: `Link ${herbal.name} berhasil disalin`,
      });
    } catch {
      toast.error('Gagal menyalin link', {
        description: 'Silakan salin secara manual',
      });
    }
  };

  // ── Derived values ───────────────────────────────────────────────

  const safetyKey = (herbal.safetyRating ?? '').toLowerCase().trim();
  const safety = SAFETY_CONFIG[safetyKey] ?? SAFETY_FALLBACK;
  const SafetyIcon = safety.Icon;

  const interactionsCount = herbal.interactions?.length ?? 0;
  const compoundsCount = herbal.compounds?.length ?? 0;

  const subtitle =
    herbal.latinName ?? getFirstCommonName(herbal.commonNames ?? null);

  // Max 3 indications in card — rest visible in detail page
  const indicationList = herbal.indications?.slice(0, 3) ?? [];
  const hasMoreIndications = (herbal.indications?.length ?? 0) > 3;

  const categoryLabel =
    herbal.category
      ? (CATEGORY_LABELS[herbal.category] ?? herbal.category)
      : null;

  // ── Render ───────────────────────────────────────────────────────

  return (
    <Link
      href={`/herbals/${herbal.id}`}
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
        {/*
         * Safety stripe — mirrors DrugCard's warning stripe pattern.
         * Unlike DrugCard (which only shows when warnings exist),
         * HerbalCard always shows the stripe because safety classification
         * is the primary clinical signal for herbals.
         */}
        <div
          className={cn('h-0.5 w-full', safety.stripe)}
          aria-hidden
        />

        <div className="p-3 sm:p-4 flex flex-col gap-2.5 h-full">
          {/* ── Row 1: Icon + Name + Actions ─────────────────────── */}
          <div className="flex items-start gap-3">
            {/*
             * Icon uses safety-color background instead of a fixed
             * emerald — this visually links the icon to the safety level
             * for instant pattern recognition.
             */}
            <div
              className={cn(
                'flex-shrink-0 flex items-center justify-center',
                'h-9 w-9 sm:h-10 sm:w-10 rounded-xl',
                'transition-transform duration-200 group-hover:scale-105',
                safety.iconBg,
              )}
              aria-hidden
            >
              <Leaf className={cn('h-4 w-4 sm:h-5 sm:w-5', safety.iconText)} />
            </div>

            {/* Herbal name + Latin/common name */}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base leading-snug truncate">
                {herbal.name}
              </h3>
              {subtitle && (
                <p
                  className={cn(
                    'text-xs text-muted-foreground truncate mt-0.5',
                    herbal.latinName && 'italic',
                  )}
                >
                  {subtitle}
                </p>
              )}
            </div>

            {/* Action buttons — always visible (same reasoning as DrugCard) */}
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

          {/* ── Row 2: Safety badge + category ──────────────────── */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/*
             * Safety badge is the PRIMARY badge — rendered first, larger
             * ring, includes safety icon for color-blind accessibility.
             */}
            {herbal.safetyRating && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
                  'text-[10px] sm:text-xs font-semibold leading-none',
                  'ring-1 ring-inset',
                  safety.badge,
                )}
                aria-label={`Keamanan: ${safety.label}`}
              >
                <SafetyIcon className="h-2.5 w-2.5" aria-hidden />
                {herbal.safetyRating}
              </span>
            )}

            {/* Category — secondary, lower visual weight */}
            {categoryLabel && (
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5',
                  'text-[10px] font-medium leading-none',
                  'bg-muted text-muted-foreground',
                )}
              >
                {categoryLabel}
              </span>
            )}

            {/* Plant part — tertiary, very subtle */}
            {herbal.plantPart && (
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5',
                  'text-[10px] leading-none',
                  'ring-1 ring-border text-muted-foreground/70',
                )}
              >
                {herbal.plantPart}
              </span>
            )}
          </div>

          {/* ── Row 3: Stats bar ─────────────────────────────────── */}
          {(compoundsCount > 0 || interactionsCount > 0) && (
            <div className="flex items-center gap-2">
              {compoundsCount > 0 && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 rounded px-1.5 py-0.5"
                  aria-label={`${compoundsCount} senyawa aktif`}
                >
                  <FlaskConical className="h-2.5 w-2.5" aria-hidden />
                  <span className="font-numeric">{compoundsCount}</span>
                  <span>senyawa</span>
                </span>
              )}
              {interactionsCount > 0 && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded px-1.5 py-0.5',
                    'text-[10px] font-medium',
                    'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
                    'dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-700/50',
                  )}
                  aria-label={`${interactionsCount} interaksi obat`}
                >
                  <AlertTriangle className="h-2.5 w-2.5" aria-hidden />
                  <span className="font-numeric">{interactionsCount}</span>
                  <span>interaksi</span>
                </span>
              )}
            </div>
          )}

          {/* ── Row 4: Indications with evidence levels ──────────── */}
          {indicationList.length > 0 && (
            <div className="mt-auto pt-2 border-t border-border/50">
              <div className="flex flex-col gap-1">
                {indicationList.map((ind, i) => (
                  <div key={i} className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] sm:text-xs text-muted-foreground truncate flex-1 leading-relaxed">
                      {ind.indication}
                    </span>
                    {ind.evidenceLevel && (
                      <EvidenceBadge level={ind.evidenceLevel} />
                    )}
                  </div>
                ))}
                {hasMoreIndications && (
                  <span className="text-[10px] text-muted-foreground/50">
                    +{(herbal.indications?.length ?? 0) - 3} indikasi lainnya
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}