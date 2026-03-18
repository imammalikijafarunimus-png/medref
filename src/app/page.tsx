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
      {/* Brand + Greeting */}
      <div className="text-center mb-7 md:mb-9 space-y-3">
        {/* Logo mark + wordmark */}
        <div className="flex items-center justify-center gap-2.5">
          {/*
           * Heartbeat pulse icon — evokes a clinical monitor.
           * Simple, recognizable, and appropriate for medical context.
           */}
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={2.25}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-primary shrink-0"
          >
            <path d="M2 12h3l3-8 4 16 3-8h7" stroke="currentColor" />
          </svg>

          {/*
           * Wordmark: Subtle gradient as brand identity.
           * Professional yet distinctive for a medical app.
           */}
          <h1
            className={cn(
              'text-3xl sm:text-4xl font-bold tracking-tight',
              'bg-gradient-to-r from-primary via-primary to-cyan-600',
              'bg-clip-text text-transparent'
            )}
          >
            MedRef
          </h1>
        </div>

        {/* Tagline — legible size for quick glance in clinical setting */}
        <p className="text-sm text-muted-foreground font-medium">
          Sistem Referensi Klinis Personal
        </p>

        {/* Time-based greeting (client component) */}
        <div className="flex justify-center pt-1">
          <TimeGreeting />
        </div>
      </div>

      {/* Search — visually dominant, the primary CTA */}
      <SearchBar
        placeholder="Cari obat, herbal, gejala, catatan klinis..."
        className="w-full"
        autoFocus={false}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Section Heading
// ─────────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4 sm:mb-5">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest px-1 select-none">
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
      color: 'rose' as const,
    },
  ] as const;

  return (
    <section
      aria-label="Akses Cepat"
      className="w-full max-w-5xl mx-auto mt-8 sm:mt-10"
    >
      <SectionHeading>Akses Cepat</SectionHeading>

      {/*
       * Grid: 2 cols mobile → 3 cols tablet → 4 cols desktop.
       * The sm breakpoint prevents the wide-and-only-two-column layout.
       */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {menuAksesCepat.map((item, idx) => (
          <div
            key={item.href}
            className="motion-safe:animate-[fadeSlideIn_0.3s_ease-out_both]"
            style={{ animationDelay: `${idx * 35}ms` }}
          >
            <QuickAccessCard
              title={item.title}
              description={item.description}
              href={item.href}
              icon={item.icon}
              color={item.color}
              count={'count' in item ? item.count : undefined}
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
    <div className="rounded-xl border bg-card p-4 sm:p-5 min-h-[130px]">
      <div className="flex items-start justify-between">
        <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl" />
        <Skeleton className="h-4 w-4 mt-0.5" />
      </div>
      <Skeleton className="h-4 w-3/4 mt-3.5" />
      <Skeleton className="h-3 w-full mt-2" />
      <Skeleton className="h-3 w-2/3 mt-1.5" />
      <Skeleton className="h-5 w-16 rounded-full mt-auto pt-3" />
    </div>
  );
}

function SkeletonAksesCepat() {
  return (
    <section
      aria-label="Memuat akses cepat"
      aria-busy="true"
      className="w-full max-w-5xl mx-auto mt-8 sm:mt-10"
    >
      <div className="flex items-center gap-3 mb-4 sm:mb-5">
        <div className="h-px flex-1 bg-border" />
        <Skeleton className="h-3 w-20 rounded" />
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="motion-safe:animate-[fadeSlideIn_0.3s_ease-out_both]"
            style={{ animationDelay: `${i * 50}ms` }}
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
    <div className="flex flex-col items-center w-full px-4 py-10 sm:py-12 md:py-14">
      <BagianPencarian />

      <Suspense fallback={<SkeletonAksesCepat />}>
        <BagianAksesCepat />
      </Suspense>
    </div>
  );
}