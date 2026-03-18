import Link from 'next/link';
import {
  Pill,
  Calculator,
  AlertTriangle,
  Leaf,
  FileText,
  Heart,
  ChevronRight,
  Beaker,
  Stethoscope,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface QuickAccessCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: 'blue' | 'orange' | 'red' | 'green' | 'purple' | 'teal' | 'cyan';
  count?: number;
}

// ─── Icon Map ─────────────────────────────────────────────────────────────────

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  pill: Pill,
  calculator: Calculator,
  alert: AlertTriangle,
  leaf: Leaf,
  file: FileText,
  stethoscope: Stethoscope,
  heart: Heart,
  beaker: Beaker,
};

// ─── Color Map ────────────────────────────────────────────────────────────────
// Each entry provides tokens for icon, border, shadow, and badge styling

interface ColorTokens {
  iconGradient: string;
  iconText: string;
  borderHover: string;
  cardShadow: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentGradient: string;
}

const colorMap: Record<string, ColorTokens> = {
  blue: {
    iconGradient:
      'bg-gradient-to-br from-sky-100 to-sky-50 dark:from-sky-900/40 dark:to-sky-950/20',
    iconText: 'text-sky-600 dark:text-sky-400',
    borderHover: 'hover:border-sky-300 dark:hover:border-sky-700',
    cardShadow:
      'motion-safe:hover:shadow-sky-500/10 dark:motion-safe:hover:shadow-sky-500/5',
    badgeBg: 'bg-sky-50 dark:bg-sky-950/40',
    badgeText: 'text-sky-700 dark:text-sky-300',
    badgeBorder: 'border-sky-200 dark:border-sky-800',
    accentGradient: 'from-sky-500 to-sky-400',
  },
  orange: {
    iconGradient:
      'bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-950/20',
    iconText: 'text-amber-600 dark:text-amber-400',
    borderHover: 'hover:border-amber-300 dark:hover:border-amber-700',
    cardShadow:
      'motion-safe:hover:shadow-amber-500/10 dark:motion-safe:hover:shadow-amber-500/5',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeBorder: 'border-amber-200 dark:border-amber-800',
    accentGradient: 'from-amber-500 to-amber-400',
  },
  red: {
    iconGradient:
      'bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-900/40 dark:to-rose-950/20',
    iconText: 'text-rose-600 dark:text-rose-400',
    borderHover: 'hover:border-rose-300 dark:hover:border-rose-700',
    cardShadow:
      'motion-safe:hover:shadow-rose-500/10 dark:motion-safe:hover:shadow-rose-500/5',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    badgeText: 'text-rose-700 dark:text-rose-300',
    badgeBorder: 'border-rose-200 dark:border-rose-800',
    accentGradient: 'from-rose-500 to-rose-400',
  },
  green: {
    iconGradient:
      'bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-950/20',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    borderHover: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    cardShadow:
      'motion-safe:hover:shadow-emerald-500/10 dark:motion-safe:hover:shadow-emerald-500/5',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgeBorder: 'border-emerald-200 dark:border-emerald-800',
    accentGradient: 'from-emerald-500 to-emerald-400',
  },
  purple: {
    iconGradient:
      'bg-gradient-to-br from-violet-100 to-violet-50 dark:from-violet-900/40 dark:to-violet-950/20',
    iconText: 'text-violet-600 dark:text-violet-400',
    borderHover: 'hover:border-violet-300 dark:hover:border-violet-700',
    cardShadow:
      'motion-safe:hover:shadow-violet-500/10 dark:motion-safe:hover:shadow-violet-500/5',
    badgeBg: 'bg-violet-50 dark:bg-violet-950/40',
    badgeText: 'text-violet-700 dark:text-violet-300',
    badgeBorder: 'border-violet-200 dark:border-violet-800',
    accentGradient: 'from-violet-500 to-violet-400',
  },
  teal: {
    iconGradient:
      'bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-900/40 dark:to-teal-950/20',
    iconText: 'text-teal-600 dark:text-teal-400',
    borderHover: 'hover:border-teal-300 dark:hover:border-teal-700',
    cardShadow:
      'motion-safe:hover:shadow-teal-500/10 dark:motion-safe:hover:shadow-teal-500/5',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/40',
    badgeText: 'text-teal-700 dark:text-teal-300',
    badgeBorder: 'border-teal-200 dark:border-teal-800',
    accentGradient: 'from-teal-500 to-teal-400',
  },
  cyan: {
    iconGradient:
      'bg-gradient-to-br from-cyan-100 to-cyan-50 dark:from-cyan-900/40 dark:to-cyan-950/20',
    iconText: 'text-cyan-600 dark:text-cyan-400',
    borderHover: 'hover:border-cyan-300 dark:hover:border-cyan-700',
    cardShadow:
      'motion-safe:hover:shadow-cyan-500/10 dark:motion-safe:hover:shadow-cyan-500/5',
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/40',
    badgeText: 'text-cyan-700 dark:text-cyan-300',
    badgeBorder: 'border-cyan-200 dark:border-cyan-800',
    accentGradient: 'from-cyan-500 to-cyan-400',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * QuickAccessCard
 *
 * An enhanced navigation card for the MedRef homepage. Features:
 *  - Gradient icon container with per-color theming
 *  - Top-edge accent stripe on hover
 *  - Hover lift + colored shadow (respects prefers-reduced-motion)
 *  - Animated ChevronRight slides right on group-hover
 *  - Prominent count badge with pop animation
 *  - Full dark mode & WCAG focus-visible ring
 */
export function QuickAccessCard({
  title,
  description,
  href,
  icon,
  color,
  count,
}: QuickAccessCardProps) {
  const Icon = iconMap[icon] ?? Pill;
  const c = colorMap[color] ?? colorMap.blue;

  return (
    <Link
      href={href}
      // `group` enables child group-hover utilities
      className={cn(
        'group block rounded-xl',
        // Focus-visible ring for keyboard navigation
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
    >
      <div
        className={cn(
          // Base layout & cursor
          'relative h-full cursor-pointer overflow-hidden',
          'rounded-xl border bg-card',
          // Smooth transitions (lift + shadow + border)
          'transition-all duration-200 ease-out',
          // Lift on hover — gated by motion-safe
          'motion-safe:hover:-translate-y-1',
          // Colored shadow on hover
          'hover:shadow-lg',
          c.cardShadow,
          // Border accent on hover
          c.borderHover,
          // Tap feedback on mobile
          'active:scale-[0.98] active:translate-y-0'
        )}
      >
        {/* Subtle top-edge accent line — adds a "brand stripe" feel */}
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-x-0 top-0 h-[2px] rounded-t-xl',
            'bg-gradient-to-r opacity-0 transition-opacity duration-200',
            'group-hover:opacity-100',
            c.accentGradient
          )}
        />

        <div className="p-4 sm:p-5">
          {/* ── Top row: icon + chevron ─────────────────────────────── */}
          <div className="flex items-start justify-between">
            {/* Gradient icon container */}
            <div
              className={cn(
                'flex items-center justify-center',
                'h-10 w-10 sm:h-11 sm:w-11 rounded-xl',
                'transition-transform duration-200',
                'motion-safe:group-hover:scale-110',
                c.iconGradient,
                // Subtle inner shadow for depth
                'shadow-sm'
              )}
            >
              <Icon
                className={cn('h-5 w-5 sm:h-6 sm:w-6', c.iconText)}
                aria-hidden="true"
              />
            </div>

            {/* Animated chevron */}
            <ChevronRight
              className={cn(
                'h-4 w-4 text-muted-foreground/40',
                'transition-all duration-200',
                // Slide right + become more visible on group hover
                'motion-safe:group-hover:translate-x-0.5 group-hover:text-muted-foreground/70'
              )}
              aria-hidden="true"
            />
          </div>

          {/* ── Title ────────────────────────────────────────────────── */}
          <h3 className="mt-3 font-semibold text-sm sm:text-base leading-snug">
            {title}
          </h3>

          {/* ── Description ──────────────────────────────────────────── */}
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* ── Count badge ──────────────────────────────────────────── */}
          {count !== undefined && (
            <div
              className={cn(
                'mt-3 inline-flex items-center gap-1.5',
                'px-2.5 py-0.5 rounded-full',
                'text-xs font-semibold tracking-wide',
                'border',
                // Slight scale-in on mount; use motion-safe so it degrades gracefully
                'motion-safe:animate-[badgePop_0.3s_ease-out_both]',
                c.badgeBg,
                c.badgeText,
                c.badgeBorder
              )}
            >
              {/* Mini dot for visual weight */}
              <span
                aria-hidden="true"
                className={cn('h-1.5 w-1.5 rounded-full opacity-70', c.iconText)}
              />
              <span className="font-numeric tabular-nums">
                {count.toLocaleString('id-ID')}
              </span>
              <span className="opacity-70 font-normal">item</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}