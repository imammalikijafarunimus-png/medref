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

export interface HerbalWithRelations {
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
}

interface HerbalCardProps {
  herbal: HerbalWithRelations;
}

// ─────────────────────────────────────────────────────────────────
// Safety Config (using semantic CSS variables)
// ─────────────────────────────────────────────────────────────────

type SafetyConfig = {
  stripe: string;
  iconBg: string;
  iconText: string;
  badge: string;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
};

const SAFETY_CONFIG: Record<string, SafetyConfig> = {
  aman: {
    stripe: 'bg-[color:var(--safety-safe)]',
    iconBg: 'bg-[var(--safety-safe-subtle)]',
    iconText: 'text-[color:var(--safety-safe)]',
    badge:
      'bg-[var(--safety-safe-subtle)] text-[color:var(--safety-safe-foreground)] ring-[color:var(--safety-safe-border)]',
    Icon: CheckCircle2,
    label: 'Aman',
  },
  safe: {
    stripe: 'bg-[color:var(--safety-safe)]',
    iconBg: 'bg-[var(--safety-safe-subtle)]',
    iconText: 'text-[color:var(--safety-safe)]',
    badge:
      'bg-[var(--safety-safe-subtle)] text-[color:var(--safety-safe-foreground)] ring-[color:var(--safety-safe-border)]',
    Icon: CheckCircle2,
    label: 'Aman',
  },
  'hati-hati': {
    stripe: 'bg-[color:var(--safety-caution)]',
    iconBg: 'bg-[var(--safety-caution-subtle)]',
    iconText: 'text-[color:var(--safety-caution)]',
    badge:
      'bg-[var(--safety-caution-subtle)] text-[color:var(--safety-caution-foreground)] ring-[color:var(--safety-caution-border)]',
    Icon: AlertCircle,
    label: 'Hati-hati',
  },
  caution: {
    stripe: 'bg-[color:var(--safety-caution)]',
    iconBg: 'bg-[var(--safety-caution-subtle)]',
    iconText: 'text-[color:var(--safety-caution)]',
    badge:
      'bg-[var(--safety-caution-subtle)] text-[color:var(--safety-caution-foreground)] ring-[color:var(--safety-caution-border)]',
    Icon: AlertCircle,
    label: 'Hati-hati',
  },
  'tidak aman': {
    stripe: 'bg-[color:var(--safety-unsafe)]',
    iconBg: 'bg-[var(--safety-unsafe-subtle)]',
    iconText: 'text-[color:var(--safety-unsafe)]',
    badge:
      'bg-[var(--safety-unsafe-subtle)] text-[color:var(--safety-unsafe-foreground)] ring-[color:var(--safety-unsafe-border)]',
    Icon: XCircle,
    label: 'Tidak Aman',
  },
  'tidak-aman': {
    stripe: 'bg-[color:var(--safety-unsafe)]',
    iconBg: 'bg-[var(--safety-unsafe-subtle)]',
    iconText: 'text-[color:var(--safety-unsafe)]',
    badge:
      'bg-[var(--safety-unsafe-subtle)] text-[color:var(--safety-unsafe-foreground)] ring-[color:var(--safety-unsafe-border)]',
    Icon: XCircle,
    label: 'Tidak Aman',
  },
  unsafe: {
    stripe: 'bg-[color:var(--safety-unsafe)]',
    iconBg: 'bg-[var(--safety-unsafe-subtle)]',
    iconText: 'text-[color:var(--safety-unsafe)]',
    badge:
      'bg-[var(--safety-unsafe-subtle)] text-[color:var(--safety-unsafe-foreground)] ring-[color:var(--safety-unsafe-border)]',
    Icon: XCircle,
    label: 'Tidak Aman',
  },
};

const SAFETY_FALLBACK: SafetyConfig = {
  stripe: 'bg-muted-foreground/40',
  iconBg: 'bg-muted',
  iconText: 'text-muted-foreground',
  badge:
    'bg-muted text-muted-foreground ring-border',
  Icon: Leaf,
  label: 'Herbal',
};

// ─────────────────────────────────────────────────────────────────
// Evidence Level Config
// ─────────────────────────────────────────────────────────────────

type EvidenceStyle = {
  className: string;
  label: string;
};

const EVIDENCE_STYLES: Record<string, EvidenceStyle> = {
  kuat: {
    className:
      'bg-[var(--success-subtle)] text-[color:var(--success-subtle-foreground)] font-semibold',
    label: 'Kuat',
  },
  strong: {
    className:
      'bg-[var(--success-subtle)] text-[color:var(--success-subtle-foreground)] font-semibold',
    label: 'Kuat',
  },
  moderat: {
    className:
      'bg-[var(--info-subtle)] text-[color:var(--info-subtle-foreground)] ring-1 ring-[var(--info-border)]',
    label: 'Moderat',
  },
  moderate: {
    className:
      'bg-[var(--info-subtle)] text-[color:var(--info-subtle-foreground)] ring-1 ring-[var(--info-border)]',
    label: 'Moderat',
  },
  lemah: {
    className:
      'text-[color:var(--warning-subtle-foreground)] ring-1 ring-[var(--warning-border)]',
    label: 'Lemah',
  },
  weak: {
    className:
      'text-[color:var(--warning-subtle-foreground)] ring-1 ring-[var(--warning-border)]',
    label: 'Lemah',
  },
  tradisional: {
    className:
      'text-violet-600 dark:text-violet-400 ring-1 ring-violet-300 dark:ring-violet-600/50 italic',
    label: 'Tradisional',
  },
  traditional: {
    className:
      'text-violet-600 dark:text-violet-400 ring-1 ring-violet-300 dark:ring-violet-600/50 italic',
    label: 'Tradisional',
  },
};

// ─────────────────────────────────────────────────────────────────
// Category Labels (Indonesian)
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
// Favorites storage helpers
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
// Sub-components
// ─────────────────────────────────────────────────────────────────

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
        'text-muted-foreground hover:text-foreground hover:bg-muted',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring focus-visible:ring-offset-1',
        active && 'text-[color:var(--danger)] hover:text-[color:var(--danger)]'
      )}
    >
      {children}
    </button>
  );
}

function EvidenceBadge({ level }: { level: string }) {
  const key = level.toLowerCase();
  const style = EVIDENCE_STYLES[key];
  if (!style) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5',
        'text-[9px] leading-none',
        'motion-safe:animate-[badgePop_0.3s_ease-out_both]',
        style.className
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
      favorites.some((f) => f.itemId === herbal.id && f.type === 'herbal')
    );
  }, [herbal.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const favorites = readFavorites();

      if (isFavorite) {
        writeFavorites(
          favorites.filter(
            (f) => !(f.itemId === herbal.id && f.type === 'herbal')
          )
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
    } catch {
      toast.error('Gagal memperbarui favorit', { description: 'Coba lagi nanti' });
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

  // Derived values
  const safetyKey = (herbal.safetyRating ?? '').toLowerCase().trim();
  const safety = SAFETY_CONFIG[safetyKey] ?? SAFETY_FALLBACK;
  const SafetyIcon = safety.Icon;

  const interactionsCount = herbal.interactions?.length ?? 0;
  const compoundsCount = herbal.compounds?.length ?? 0;

  const subtitle =
    herbal.latinName ?? getFirstCommonName(herbal.commonNames ?? null);

  const indicationList = herbal.indications?.slice(0, 3) ?? [];
  const hasMoreIndications = (herbal.indications?.length ?? 0) > 3;

  const categoryLabel =
    herbal.category
      ? (CATEGORY_LABELS[herbal.category] ?? herbal.category)
      : null;

  return (
    <Link
      href={`/herbals/${herbal.id}`}
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
        {/* Safety stripe — always visible */}
        <div
          className={cn('h-0.5 w-full', safety.stripe)}
          aria-hidden
        />

        <div className="p-3 sm:p-4 flex flex-col gap-2.5 h-full">
          {/* Row 1: Icon + Name + Actions */}
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex-shrink-0 flex items-center justify-center',
                'h-9 w-9 sm:h-10 sm:w-10 rounded-xl',
                'transition-transform duration-200',
                'motion-safe:group-hover:scale-105',
                safety.iconBg
              )}
              aria-hidden
            >
              <Leaf className={cn('h-4 w-4 sm:h-5 sm:w-5', safety.iconText)} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base leading-snug truncate">
                {herbal.name}
              </h3>
              {subtitle && (
                <p
                  className={cn(
                    'text-xs text-muted-foreground truncate mt-0.5',
                    herbal.latinName && 'italic'
                  )}
                >
                  {subtitle}
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

          {/* Row 2: Safety badge + category */}
          <div className="flex flex-wrap items-center gap-1.5">
            {herbal.safetyRating && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
                  'text-[10px] sm:text-xs font-semibold leading-none',
                  'ring-1 ring-inset',
                  'motion-safe:animate-[badgePop_0.3s_ease-out_both]',
                  safety.badge
                )}
                aria-label={`Keamanan: ${safety.label}`}
              >
                <SafetyIcon className="h-2.5 w-2.5" aria-hidden />
                {herbal.safetyRating}
              </span>
            )}

            {categoryLabel && (
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5',
                  'text-[10px] font-medium leading-none',
                  'bg-muted text-muted-foreground'
                )}
              >
                {categoryLabel}
              </span>
            )}

            {herbal.plantPart && (
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5',
                  'text-[10px] leading-none',
                  'ring-1 ring-border text-muted-foreground/70'
                )}
              >
                {herbal.plantPart}
              </span>
            )}
          </div>

          {/* Row 3: Stats bar */}
          {(compoundsCount > 0 || interactionsCount > 0) && (
            <div className="flex items-center gap-2">
              {compoundsCount > 0 && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 rounded px-1.5 py-0.5"
                  aria-label={`${compoundsCount} senyawa aktif`}
                >
                  <FlaskConical className="h-2.5 w-2.5" aria-hidden />
                  <span className="font-numeric tabular-nums">{compoundsCount}</span>
                  <span>senyawa</span>
                </span>
              )}
              {interactionsCount > 0 && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded px-1.5 py-0.5',
                    'text-[10px] font-medium',
                    'bg-[var(--warning-subtle)] text-[color:var(--warning-subtle-foreground)] ring-1 ring-inset ring-[var(--warning-border)]'
                  )}
                  aria-label={`${interactionsCount} interaksi obat`}
                >
                  <AlertTriangle className="h-2.5 w-2.5" aria-hidden />
                  <span className="font-numeric tabular-nums">{interactionsCount}</span>
                  <span>interaksi</span>
                </span>
              )}
            </div>
          )}

          {/* Row 4: Indications with evidence levels */}
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