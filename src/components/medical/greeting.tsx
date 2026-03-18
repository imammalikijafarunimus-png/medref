'use client';

import { useState, useEffect } from 'react';
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
}

/** Returns the matching time period for a given hour (0-23). */
function getTimePeriod(hour: number): TimePeriod {
  if (hour >= 4 && hour < 12) {
    return { greeting: 'Selamat pagi' };
  }
  if (hour >= 12 && hour < 15) {
    return { greeting: 'Selamat siang' };
  }
  if (hour >= 15 && hour < 18) {
    return { greeting: 'Selamat sore' };
  }
  // 18:00 – 03:59
  return { greeting: 'Selamat malam' };
}

/** Format date to Indonesian locale */
function formatDate(date: Date): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${day} ${month} ${year}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * TimeGreeting
 *
 * Displays a time-aware Indonesian greeting with current date.
 * Rendered client-side to avoid hydration mismatches from the clock.
 */
export function TimeGreeting({ name = 'Dokter', className }: TimeGreetingProps) {
  const [period, setPeriod] = useState<TimePeriod | null>(null);
  const [dateStr, setDateStr] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Determine time period once on mount (client-only)
    const now = new Date();
    const hour = now.getHours();
    setPeriod(getTimePeriod(hour));
    setDateStr(formatDate(now));
    setMounted(true);
  }, []);

  // ── Skeleton / SSR placeholder ─────────────────────────────────────────────
  // Renders a neutral placeholder to avoid layout shift before hydration.
  if (!mounted || !period) {
    return (
      <p
        aria-hidden="true"
        className={cn('text-sm text-muted-foreground', className)}
      >
        <span className="inline-block h-4 w-32 bg-muted rounded animate-pulse" />
      </p>
    );
  }

  const { greeting } = period;

  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      {greeting} — {dateStr}
    </p>
  );
}