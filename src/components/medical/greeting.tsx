'use client';

import { useState, useEffect } from 'react';
import { Sun, Sunrise, Sunset, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TimeGreetingProps {
  /** Optional name shown after the greeting. Defaults to "Dokter". */
  name?: string;
  /** Additional Tailwind classes for the wrapper element. */
  className?: string;
}

// ─── Time Period Config ───────────────────────────────────────────────────────

interface TimePeriod {
  greeting: string;
  Icon: React.ComponentType<{ className?: string }>;
  /** Tailwind gradient classes for the greeting text */
  gradient: string;
  /** Accessible label for the icon */
  iconLabel: string;
}

/** Returns the matching time period for a given hour (0-23). */
function getTimePeriod(hour: number): TimePeriod {
  if (hour >= 4 && hour < 12) {
    return {
      greeting: 'Selamat Pagi',
      Icon: Sunrise,
      gradient:
        'from-amber-500 via-orange-400 to-yellow-500 dark:from-amber-400 dark:via-orange-300 dark:to-yellow-400',
      iconLabel: 'Ikon fajar pagi',
    };
  }
  if (hour >= 12 && hour < 15) {
    return {
      greeting: 'Selamat Siang',
      Icon: Sun,
      gradient:
        'from-sky-500 via-cyan-500 to-teal-500 dark:from-sky-400 dark:via-cyan-400 dark:to-teal-400',
      iconLabel: 'Ikon matahari siang',
    };
  }
  if (hour >= 15 && hour < 18) {
    return {
      greeting: 'Selamat Sore',
      Icon: Sunset,
      gradient:
        'from-orange-500 via-rose-500 to-pink-500 dark:from-orange-400 dark:via-rose-400 dark:to-pink-400',
      iconLabel: 'Ikon senja sore',
    };
  }
  // 18:00 – 03:59
  return {
    greeting: 'Selamat Malam',
    Icon: Moon,
    gradient:
      'from-indigo-500 via-violet-500 to-purple-500 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400',
    iconLabel: 'Ikon bulan malam',
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * TimeGreeting
 *
 * Displays a time-aware Indonesian greeting with an animated fade-in.
 * Rendered client-side to avoid hydration mismatches from the clock.
 *
 * Time windows:
 *  - Selamat Pagi  → 04:00 – 11:59  🌤️
 *  - Selamat Siang → 12:00 – 14:59  ☀️
 *  - Selamat Sore  → 15:00 – 17:59  🌇
 *  - Selamat Malam → 18:00 – 03:59  🌙
 */
export function TimeGreeting({ name = 'Dokter', className }: TimeGreetingProps) {
  const [period, setPeriod] = useState<TimePeriod | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Determine time period once on mount (client-only)
    const hour = new Date().getHours();
    setPeriod(getTimePeriod(hour));
    setMounted(true);
  }, []);

  // ── Skeleton / SSR placeholder ─────────────────────────────────────────────
  // Renders a neutral placeholder to avoid layout shift before hydration.
  if (!mounted || !period) {
    return (
      <div
        aria-hidden="true"
        className={cn('flex items-center justify-center gap-2 select-none', className)}
      >
        {/* Shimmer pill skeleton */}
        <span className="inline-block h-5 w-40 rounded-md bg-muted animate-pulse" />
      </div>
    );
  }

  const { greeting, Icon, gradient, iconLabel } = period;

  return (
    <div
      className={cn(
        // Fade + slide up on mount; honour prefers-reduced-motion
        'flex items-center justify-center gap-2 select-none',
        'motion-safe:animate-[fadeSlideIn_0.45s_ease-out_both]',
        className
      )}
    >
      {/* Gradient icon */}
      <span
        className={cn(
          'inline-flex items-center justify-center',
          'h-6 w-6 rounded-lg',
          'bg-gradient-to-br',
          gradient,
          // Subtle glow — toned down for clinical context
          'shadow-[0_2px_8px_rgba(0,0,0,0.12)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
        )}
        aria-label={iconLabel}
        role="img"
      >
        <Icon className="h-3.5 w-3.5 text-white" aria-hidden="true" />
      </span>

      {/* Greeting text */}
      <p className="text-sm text-muted-foreground">
        {greeting},{' '}
        <span
          className={cn(
            'font-semibold bg-gradient-to-r bg-clip-text text-transparent',
            gradient
          )}
        >
          {name}
        </span>
      </p>
    </div>
  );
}