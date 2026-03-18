import { Suspense } from 'react';
import { ambilJumlahData } from '@/lib/data';
import { SearchBar } from '@/components/medical/search-bar';
import { QuickAccessCard } from '@/components/medical/quick-access-card';
import { TimeGreeting } from '@/components/medical/greeting';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────────────────────────
// Hero Section
// ─────────────────────────────────────────────────────────────────

function BagianPencarian() {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Decorative background bloom — purely cosmetic */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 -z-10',
          'flex items-center justify-center overflow-hidden'
        )}
      >
        <div
          className={cn(
            'h-64 w-64 rounded-full opacity-20 blur-3xl',
            'bg-gradient-to-br from-cyan-400 via-teal-400 to-sky-500',
            'dark:opacity-10'
          )}
        />
      </div>

      {/* Brand + Greeting */}
      <div className="text-center mb-6 md:mb-8 space-y-2">
        {/* Logo mark + wordmark */}
        <div className="flex items-center justify-center gap-2.5">
          {/*
           * Stylised "pulse" icon — a simple SVG ring that evokes a
           * heartbeat monitor without adding a heavy dependency.
           */}
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7 text-primary"
          >
            <path d="M2 12h3l3-8 4 16 3-8h7" stroke="currentColor" />
          </svg>
          <h1
            className={cn(
              'text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight',
              'bg-gradient-to-r from-primary via-cyan-500 to-teal-500',
              'bg-clip-text text-transparent'
            )}
          >
            MedRef
          </h1>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-widest">
          Sistem Referensi Klinis Personal
        </p>

        {/* Time-based greeting (client component) */}
        <div className="flex justify-center pt-1">
          <TimeGreeting />
        </div>
      </div>

      {/* Search */}
      <SearchBar
        placeholder="Cari obat, herbal, gejala, catatan klinis..."
        className="w-full"
        autoFocus={false}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Section heading
// ─────────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3 sm:mb-4">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest px-2">
        {children}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Quick Access Grid
// ─────────────────────────────────────────────────────────────────

async function BagianAksesCepat() {
  const jumlah = await ambilJumlahData();

  const menuAksesCepat = [
    {
      title: 'Database Obat',
      description: 'Cari obat, dosis, interaksi',
      href: '/drugs',
      icon: 'pill',
      color: 'blue' as const,
      count: jumlah.drugsCount,
    },
    {
      title: 'Cek Interaksi',
      description: 'Periksa interaksi obat',
      href: '/interaksi',
      icon: 'alert',
      color: 'red' as const,
    },
    {
      title: 'Kalkulator Medis',
      description: 'Dosis, BMI, GFR, kalori',
      href: '/kalkulator',
      icon: 'calculator',
      color: 'orange' as const,
    },
    {
      title: 'Nilai Normal Lab',
      description: 'Referensi nilai laboratorium',
      href: '/lab-values',
      icon: 'beaker',
      color: 'cyan' as const,
    },
    {
      title: 'Obat Herbal',
      description: 'Referensi herbal berbasis bukti',
      href: '/herbals',
      icon: 'leaf',
      color: 'green' as const,
      count: jumlah.herbalsCount,
    },
    {
      title: 'Panduan Gejala',
      description: 'Cari obat berdasarkan gejala',
      href: '/symptoms',
      icon: 'stethoscope',
      color: 'teal' as const,
      count: jumlah.symptomsCount,
    },
    {
      title: 'Catatan Klinis',
      description: 'Panduan referensi cepat',
      href: '/notes',
      icon: 'file',
      color: 'purple' as const,
      count: jumlah.notesCount,
    },
    {
      title: 'Favorit',
      description: 'Item tersimpan Anda',
      href: '/favorites',
      icon: 'heart',
      color: 'red' as const,
    },
  ];

  return (
    <section
      aria-label="Akses Cepat"
      className="w-full max-w-5xl mx-auto mt-6 sm:mt-8"
    >
      <SectionHeading>Akses Cepat</SectionHeading>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {menuAksesCepat.map((item, idx) => (
          /*
           * Stagger the card entrance via a CSS animation-delay.
           * Falls back silently if the keyframe is absent
           * (motion-safe ensures no jump on reduced-motion).
           */
          <div
            key={item.href}
            className="motion-safe:animate-[fadeSlideIn_0.35s_ease-out_both]"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            <QuickAccessCard
              title={item.title}
              description={item.description}
              href={item.href}
              icon={item.icon}
              color={item.color}
              count={item.count}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// Loading Skeleton
// ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5">
      {/* Icon + chevron row */}
      <div className="flex items-start justify-between">
        <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl" />
        <Skeleton className="h-4 w-4 mt-0.5" />
      </div>
      {/* Title */}
      <Skeleton className="h-4 w-3/4 mt-3" />
      {/* Description line 1 */}
      <Skeleton className="h-3 w-full mt-2" />
      {/* Description line 2 — shorter for realism */}
      <Skeleton className="h-3 w-2/3 mt-1.5" />
      {/* Count badge placeholder — shown on alternating cards for realism */}
      <Skeleton className="h-5 w-20 rounded-full mt-3" />
    </div>
  );
}

function SkeletonAksesCepat() {
  return (
    <section
      aria-label="Memuat akses cepat"
      aria-busy="true"
      className="w-full max-w-5xl mx-auto mt-6 sm:mt-8"
    >
      {/* Mirror the section heading */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div className="h-px flex-1 bg-border" />
        <Skeleton className="h-3 w-20 rounded" />
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="motion-safe:animate-[fadeSlideIn_0.35s_ease-out_both]"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <SkeletonCard />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// Page Root
// ─────────────────────────────────────────────────────────────────

export default function HalamanUtama() {
  return (
    <div className="flex flex-col items-center w-full px-4 py-8 sm:py-10 md:py-12">
      <BagianPencarian />

      <Suspense fallback={<SkeletonAksesCepat />}>
        <BagianAksesCepat />
      </Suspense>
    </div>
  );
}