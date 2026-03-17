// /src/app/page.tsx
import { Suspense } from 'react';
import { ambilJumlahData } from '@/lib/data';
import { SearchBar } from '@/components/medical/search-bar';
import { QuickAccessCard } from '@/components/medical/quick-access-card';
import { Greeting } from '@/components/medical/greeting';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────────────────────────
// Hero Section
// ─────────────────────────────────────────────────────────────────

function BagianPencarian() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Brand */}
      <div className="text-center mb-7 md:mb-9 space-y-3">
        {/* Logo mark + wordmark */}
        <div className="flex items-center justify-center gap-2.5">
          {/* Pulse dot — medical/vitals motif */}
          <div className="relative flex h-8 w-8 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/20 duration-1000" />
            <span className="relative inline-flex h-5 w-5 rounded-full bg-primary/30 ring-2 ring-primary/50" />
          </div>

          <h1
            className={cn(
              'text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight',
              'bg-gradient-to-r from-primary via-primary to-teal-500 bg-clip-text text-transparent',
            )}
          >
            MedRef
          </h1>
        </div>

        <p className="text-sm sm:text-base text-muted-foreground">
          Sistem Referensi Klinis Personal
        </p>

        {/* Time-based greeting — client component */}
        <Greeting />
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
    <div className="w-full max-w-5xl mx-auto mt-8 sm:mt-10">
      <SectionHeading>Akses Cepat</SectionHeading>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {menuAksesCepat.map((item, i) => (
          <QuickAccessCard
            key={item.href}
            title={item.title}
            description={item.description}
            href={item.href}
            icon={item.icon}
            color={item.color}
            count={item.count}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Loading Skeleton
// ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <div className="space-y-2 pt-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  );
}

function SkeletonAksesCepat() {
  return (
    <div className="w-full max-w-5xl mx-auto mt-8 sm:mt-10">
      {/* Mimic section heading */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div className="h-px flex-1 bg-border" />
        <Skeleton className="h-3 w-20 rounded" />
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Page Root
// ─────────────────────────────────────────────────────────────────

export default function HalamanUtama() {
  return (
    <div className="flex flex-col items-center w-full">
      {/*
       * Hero background: subtle radial gradient that gives visual depth
       * without being heavy. Stays behind the content.
       */}
      <div className="absolute inset-x-0 top-0 -z-10 h-72 overflow-hidden pointer-events-none" aria-hidden>
        <div
          className={cn(
            'absolute left-1/2 top-0 -translate-x-1/2',
            'h-64 w-[600px] sm:w-[900px]',
            'rounded-full opacity-30 dark:opacity-20 blur-3xl',
            'bg-gradient-to-b from-primary/25 to-transparent',
          )}
        />
      </div>

      <BagianPencarian />

      <Suspense fallback={<SkeletonAksesCepat />}>
        <BagianAksesCepat />
      </Suspense>
    </div>
  );
}