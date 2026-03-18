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
  color: 'blue' | 'orange' | 'red' | 'green' | 'purple' | 'teal' | 'cyan' | 'rose';
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
//
// Intentionally restrained for clinical context.
// Each color provides: icon container background, icon foreground, 
// hover border, and badge styling.
// No hover shadow-color tokens; a single neutral shadow is used
// so all cards behave consistently and calmly.

interface ColorTokens {
  iconBg: string;
  iconText: string;
  borderHover: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

const colorMap: Record<QuickAccessCardProps['color'], ColorTokens> = {
  blue: {
    iconBg: 'bg-sky-50 dark:bg-sky-950/50',
    iconText: 'text-sky-600 dark:text-sky-400',
    borderHover: 'hover:border-sky-300/70 dark:hover:border-sky-700/70',
    badgeBg: 'bg-sky-50 dark:bg-sky-950/40',
    badgeText: 'text-sky-700 dark:text-sky-300',
    badgeBorder: 'border-sky-200 dark:border-sky-800',
  },
  orange: {
    iconBg: 'bg-amber-50 dark:bg-amber-950/50',
    iconText: 'text-amber-600 dark:text-amber-400',
    borderHover: 'hover:border-amber-300/70 dark:hover:border-amber-700/70',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeBorder: 'border-amber-200 dark:border-amber-800',
  },
  red: {
    iconBg: 'bg-rose-50 dark:bg-rose-950/50',
    iconText: 'text-rose-600 dark:text-rose-400',
    borderHover: 'hover:border-rose-300/70 dark:hover:border-rose-700/70',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    badgeText: 'text-rose-700 dark:text-rose-300',
    badgeBorder: 'border-rose-200 dark:border-rose-800',
  },
  green: {
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    borderHover: 'hover:border-emerald-300/70 dark:hover:border-emerald-700/70',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgeBorder: 'border-emerald-200 dark:border-emerald-800',
  },
  purple: {
    iconBg: 'bg-violet-50 dark:bg-violet-950/50',
    iconText: 'text-violet-600 dark:text-violet-400',
    borderHover: 'hover:border-violet-300/70 dark:hover:border-violet-700/70',
    badgeBg: 'bg-violet-50 dark:bg-violet-950/40',
    badgeText: 'text-violet-700 dark:text-violet-300',
    badgeBorder: 'border-violet-200 dark:border-violet-800',
  },
  teal: {
    iconBg: 'bg-teal-50 dark:bg-teal-950/50',
    iconText: 'text-teal-600 dark:text-teal-400',
    borderHover: 'hover:border-teal-300/70 dark:hover:border-teal-700/70',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/40',
    badgeText: 'text-teal-700 dark:text-teal-300',
    badgeBorder: 'border-teal-200 dark:border-teal-800',
  },
  cyan: {
    iconBg: 'bg-cyan-50 dark:bg-cyan-950/50',
    iconText: 'text-cyan-600 dark:text-cyan-400',
    borderHover: 'hover:border-cyan-300/70 dark:hover:border-cyan-700/70',
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/40',
    badgeText: 'text-cyan-700 dark:text-cyan-300',
    badgeBorder: 'border-cyan-200 dark:border-cyan-800',
  },
  rose: {
    iconBg: 'bg-rose-50 dark:bg-rose-950/50',
    iconText: 'text-rose-600 dark:text-rose-400',
    borderHover: 'hover:border-rose-300/70 dark:hover:border-rose-700/70',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    badgeText: 'text-rose-700 dark:text-rose-300',
    badgeBorder: 'border-rose-200 dark:border-rose-800',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * QuickAccessCard
 *
 * A calm, fast-scanning navigation card for the MedRef homepage.
 *
 * Design decisions:
 *  - Single hover effect (subtle lift) keeps the UI calm and medical-grade
 *  - Icon container is static — no scale animation, which reads as playful
 *  - Chevron signals navigability without additional motion
 *  - Count badge is informational; rendered without pop animation
 *  - Touch target is min-h-[130px] so the whole card is safely tappable
 *  - Focus-visible ring uses primary color at reduced opacity for visibility
 *    without aggression
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
      className={cn(
        'group block rounded-xl',
        // Keyboard focus ring — clear and accessible, offset from card edge
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-background'
      )}
    >
      <div
        className={cn(
          // Structure
          'relative h-full min-h-[130px] cursor-pointer overflow-hidden',
          'rounded-xl border bg-card',
          // Single, calm transition — only lift + border
          'transition-all duration-200 ease-out',
          // Lift: GPU-composited transform only; no layout repaint
          'motion-safe:hover:-translate-y-0.5',
          // Neutral shadow on hover — consistent across all card colors
          'hover:shadow-md',
          // Per-color border tint on hover
          c.borderHover,
          // Tap feedback: scale down slightly, cancel any lift
          'active:scale-[0.985] active:translate-y-0'
        )}
      >
        <div className="p-4 sm:p-5 flex flex-col h-full">
          {/* ── Top row: icon + chevron ──────────────────────────── */}
          <div className="flex items-start justify-between">
            {/*
             * Icon container: flat color background (no gradient),
             * rounded-xl for consistency with card shape.
             * Static — no scale on hover. The card lift is the affordance.
             */}
            <div
              className={cn(
                'flex items-center justify-center shrink-0',
                'h-10 w-10 sm:h-11 sm:w-11 rounded-xl',
                c.iconBg
              )}
            >
              <Icon
                className={cn('h-5 w-5 sm:h-[22px] sm:w-[22px]', c.iconText)}
                aria-hidden="true"
              />
            </div>

            {/*
             * Chevron: purely indicates navigability.
             * Becomes slightly more visible on hover — no translate,
             * which was imperceptibly subtle and redundant.
             */}
            <ChevronRight
              className={cn(
                'h-4 w-4 mt-0.5 shrink-0',
                'text-muted-foreground/30 transition-colors duration-200',
                'group-hover:text-muted-foreground/60'
              )}
              aria-hidden="true"
            />
          </div>

          {/* ── Title ────────────────────────────────────────────── */}
          {/*
           * text-sm sm:text-base gives the title clear dominance over
           * the description without taking too much vertical space.
           */}
          <h3 className="mt-3 font-semibold text-sm sm:text-base leading-snug text-foreground">
            {title}
          </h3>

          {/* ── Description ──────────────────────────────────────── */}
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* ── Count badge ──────────────────────────────────────── */}
          {/*
           * Pushed to the bottom of the card via mt-auto so badges
           * across a row all sit at the same vertical position,
           * reducing visual noise from irregular card heights.
           */}
          {count !== undefined && (
            <div
              className={cn(
                'mt-auto pt-3 inline-flex items-center gap-1.5 self-start',
                'px-2.5 py-1 rounded-full',
                'text-xs font-medium tracking-wide',
                'border',
                c.badgeBg,
                c.badgeText,
                c.badgeBorder
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'h-1.5 w-1.5 shrink-0 rounded-full',
                  c.iconText,
                  'opacity-60'
                )}
              />
              <span className="tabular-nums">
                {count.toLocaleString('id-ID')}
              </span>
              <span className="opacity-60 font-normal">item</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}