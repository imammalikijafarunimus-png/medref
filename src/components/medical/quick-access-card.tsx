// /src/components/medical/quick-access-card.tsx
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

interface QuickAccessCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: 'blue' | 'orange' | 'red' | 'green' | 'purple' | 'teal' | 'cyan';
  count?: number;
}

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

/**
 * Each color variant defines:
 * - iconBg: gradient background for the icon container
 * - iconText: icon color
 * - glow: box-shadow color on hover (via Tailwind arbitrary)
 * - badgeBg / badgeText: count badge
 * - border: hover border accent
 * - shimmer: gradient overlay direction (for card shine effect)
 */
const colorMap = {
  blue: {
    iconBg: 'bg-gradient-to-br from-sky-100 to-sky-200 dark:from-sky-900/50 dark:to-sky-800/40',
    iconText: 'text-sky-600 dark:text-sky-300',
    glow: 'hover:shadow-sky-100/80 dark:hover:shadow-sky-900/50',
    badgeBg: 'bg-sky-50 dark:bg-sky-900/40',
    badgeText: 'text-sky-600 dark:text-sky-300',
    border: 'hover:border-sky-200 dark:hover:border-sky-700',
    accent: 'from-sky-500/10',
  },
  orange: {
    iconBg: 'bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/40',
    iconText: 'text-amber-600 dark:text-amber-300',
    glow: 'hover:shadow-amber-100/80 dark:hover:shadow-amber-900/50',
    badgeBg: 'bg-amber-50 dark:bg-amber-900/40',
    badgeText: 'text-amber-600 dark:text-amber-300',
    border: 'hover:border-amber-200 dark:hover:border-amber-700',
    accent: 'from-amber-500/10',
  },
  red: {
    iconBg: 'bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900/50 dark:to-rose-800/40',
    iconText: 'text-rose-600 dark:text-rose-300',
    glow: 'hover:shadow-rose-100/80 dark:hover:shadow-rose-900/50',
    badgeBg: 'bg-rose-50 dark:bg-rose-900/40',
    badgeText: 'text-rose-600 dark:text-rose-300',
    border: 'hover:border-rose-200 dark:hover:border-rose-700',
    accent: 'from-rose-500/10',
  },
  green: {
    iconBg: 'bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/40',
    iconText: 'text-emerald-600 dark:text-emerald-300',
    glow: 'hover:shadow-emerald-100/80 dark:hover:shadow-emerald-900/50',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-900/40',
    badgeText: 'text-emerald-600 dark:text-emerald-300',
    border: 'hover:border-emerald-200 dark:hover:border-emerald-700',
    accent: 'from-emerald-500/10',
  },
  purple: {
    iconBg: 'bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-900/50 dark:to-violet-800/40',
    iconText: 'text-violet-600 dark:text-violet-300',
    glow: 'hover:shadow-violet-100/80 dark:hover:shadow-violet-900/50',
    badgeBg: 'bg-violet-50 dark:bg-violet-900/40',
    badgeText: 'text-violet-600 dark:text-violet-300',
    border: 'hover:border-violet-200 dark:hover:border-violet-700',
    accent: 'from-violet-500/10',
  },
  teal: {
    iconBg: 'bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/50 dark:to-teal-800/40',
    iconText: 'text-teal-600 dark:text-teal-300',
    glow: 'hover:shadow-teal-100/80 dark:hover:shadow-teal-900/50',
    badgeBg: 'bg-teal-50 dark:bg-teal-900/40',
    badgeText: 'text-teal-600 dark:text-teal-300',
    border: 'hover:border-teal-200 dark:hover:border-teal-700',
    accent: 'from-teal-500/10',
  },
  cyan: {
    iconBg: 'bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/50 dark:to-cyan-800/40',
    iconText: 'text-cyan-600 dark:text-cyan-300',
    glow: 'hover:shadow-cyan-100/80 dark:hover:shadow-cyan-900/50',
    badgeBg: 'bg-cyan-50 dark:bg-cyan-900/40',
    badgeText: 'text-cyan-600 dark:text-cyan-300',
    border: 'hover:border-cyan-200 dark:hover:border-cyan-700',
    accent: 'from-cyan-500/10',
  },
} satisfies Record<string, Record<string, string>>;

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
        'group relative flex flex-col rounded-xl border bg-card overflow-hidden',
        'transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-lg',
        'active:scale-[0.97] active:shadow-sm',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        c.glow,
        c.border,
      )}
    >
      {/* Subtle gradient accent top-right corner */}
      <div
        className={cn(
          'pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full opacity-0',
          'bg-gradient-to-br',
          c.accent,
          'to-transparent blur-xl',
          'group-hover:opacity-100 transition-opacity duration-300',
        )}
        aria-hidden
      />

      <div className="relative p-4 sm:p-5 flex flex-col h-full">
        {/* Top row: icon + arrow */}
        <div className="flex items-start justify-between">
          <div
            className={cn(
              'flex items-center justify-center rounded-xl p-2.5 sm:p-3',
              'transition-transform duration-200 group-hover:scale-105',
              c.iconBg,
            )}
          >
            <Icon className={cn('h-5 w-5 sm:h-6 sm:w-6', c.iconText)} />
          </div>

          <ChevronRight
            className={cn(
              'h-4 w-4 mt-0.5 text-muted-foreground/30',
              'transition-all duration-200',
              'group-hover:text-muted-foreground/60 group-hover:translate-x-0.5',
            )}
          />
        </div>

        {/* Text */}
        <div className="mt-3 flex-1">
          <h3 className="font-semibold text-sm sm:text-base leading-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Count badge */}
        {count !== undefined && (
          <div
            className={cn(
              'mt-3 self-start inline-flex items-center gap-1',
              'px-2 py-0.5 rounded-full text-xs font-medium',
              'ring-1 ring-inset',
              c.badgeBg,
              c.badgeText,
              // ring uses the same color as text with low opacity
              'ring-current/20',
            )}
          >
            <span className="font-numeric tabular-nums">
              {count.toLocaleString('id-ID')}
            </span>
            <span className="opacity-70">item</span>
          </div>
        )}
      </div>
    </Link>
  );
}