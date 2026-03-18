import { Suspense } from 'react';
import { ambilJumlahData } from '@/lib/data';
import { SearchBar } from '@/components/medical/search-bar';
import { QuickAccessCard } from '@/components/medical/quick-access-card';
import { TimeGreeting } from '@/components/medical/greeting';
import { PopularSearchTags } from '@/components/medical/popular-search-tags';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────────────────────────
// Background Canvas (orbs + grid)
// ─────────────────────────────────────────────────────────────────

function BackgroundCanvas() {
  return (
    <>
      {/* Animated gradient orbs */}
      <div className="bg-canvas" aria-hidden>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      {/* Grid overlay */}
      <div className="grid-overlay" aria-hidden />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Hero Section
// ─────────────────────────────────────────────────────────────────

function BagianHero() {
  return (
    <section className="flex flex-col items-center text-center pt-10 sm:pt-14 pb-8 sm:pb-10">
      {/* Badge */}
      <div className="hero-badge fade-up" style={{ animationDelay: '0ms' }}>
        <span className="hero-badge-dot" aria-hidden />
        Referensi Klinis Terpadu
      </div>

      {/* Heading */}
      <h1
        className="hero-heading mt-6 max-w-2xl fade-up"
        style={{ animationDelay: '100ms' }}
      >
        <em>MedRef</em>
      </h1>

      {/* Subtitle */}
      <p
        className="mt-4 text-base sm:text-lg text-muted-foreground max-w-md leading-relaxed fade-up"
        style={{ animationDelay: '200ms' }}
      >
        Referensi klinis yang tumbuh bersama praktikmu.
      </p>

      {/* Greeting */}
      <div className="mt-2 fade-up" style={{ animationDelay: '250ms' }}>
        <TimeGreeting />
      </div>

      {/* Search */}
      <div
        className="w-full max-w-xl mt-10 fade-up"
        style={{ animationDelay: '300ms' }}
      >
        <SearchBar
          placeholder="Cari obat, herbal, gejala, catatan klinis..."
          className="w-full"
          autoFocus={false}
        />

        {/* Popular tags */}
        <PopularSearchTags className="mt-3" />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// Stats Strip
// ─────────────────────────────────────────────────────────────────

async function StatsStrip() {
  const jumlah = await ambilJumlahData();

  const stats = [
    { num: jumlah.drugsCount.toLocaleString(), label: 'Database Obat' },
    { num: jumlah.herbalsCount.toLocaleString(), label: 'Obat Herbal' },
    { num: '140+', label: 'Nilai Normal Lab' },
    { num: jumlah.notesCount.toLocaleString(), label: 'Catatan Klinis' },
  ];

  return (
    <div
      className="stats-strip w-full max-w-3xl mx-auto mt-10 fade-up"
      style={{ animationDelay: '400ms' }}
    >
      {stats.map((stat, idx) => (
        <div key={idx} className="stat-item">
          <div className="stat-number">{stat.num}</div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Section Heading
// ─────────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <div className="h-px flex-1 bg-border" />
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.12em] select-none">
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
      description: 'Cari obat, dosis, interaksi, kontraindikasi',
      href: '/drugs',
      icon: 'pill',
      color: 'blue' as const,
      count: jumlah.drugsCount,
    },
    {
      title: 'Cek Interaksi',
      description: 'Periksa interaksi antar obat secara real-time',
      href: '/interaksi',
      icon: 'alert',
      color: 'red' as const,
    },
    {
      title: 'Kalkulator Medis',
      description: 'Hitung dosis, BMI, GFR, kalori, dan lainnya',
      href: '/kalkulator',
      icon: 'calculator',
      color: 'orange' as const,
    },
    {
      title: 'Nilai Normal Lab',
      description: 'Referensi nilai laboratorium lengkap berbasis bukti',
      href: '/lab-values',
      icon: 'beaker',
      color: 'cyan' as const,
    },
    {
      title: 'Obat Herbal',
      description: 'Referensi herbal berbasis bukti ilmiah terkini',
      href: '/herbals',
      icon: 'leaf',
      color: 'green' as const,
      count: jumlah.herbalsCount,
    },
    {
      title: 'Panduan Gejala',
      description: 'Temukan obat dan diagnosis berdasarkan gejala',
      href: '/symptoms',
      icon: 'stethoscope',
      color: 'teal' as const,
      count: jumlah.symptomsCount,
    },
    {
      title: 'Catatan Klinis',
      description: 'Panduan referensi dan protokol klinis cepat',
      href: '/notes',
      icon: 'file',
      color: 'purple' as const,
      count: jumlah.notesCount,
    },
    {
      title: 'Favorit',
      description: 'Item yang tersimpan dan sering diakses',
      href: '/favorites',
      icon: 'heart',
      color: 'rose' as const,
    },
  ] as const;

  return (
    <section
      aria-label="Akses Cepat"
      className="w-full max-w-5xl mx-auto mt-12 sm:mt-16"
    >
      <div className="fade-up" style={{ animationDelay: '500ms' }}>
        <SectionHeading>Akses Cepat</SectionHeading>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {menuAksesCepat.map((item, idx) => (
          <div
            key={item.href}
            className="fade-up"
            style={{ animationDelay: `${550 + idx * 60}ms` }}
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
    <div className="quick-card">
      <Skeleton className="h-11 w-11 rounded-xl" />
      <Skeleton className="h-4 w-3/4 mt-4" />
      <Skeleton className="h-3 w-full mt-2" />
      <Skeleton className="h-3 w-2/3 mt-1" />
      <div className="quick-card-footer">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-3" />
      </div>
    </div>
  );
}

function SkeletonAksesCepat() {
  return (
    <section className="w-full max-w-5xl mx-auto mt-12 sm:mt-16">
      <div className="flex items-center gap-4 mb-5">
        <div className="h-px flex-1 bg-border" />
        <Skeleton className="h-3 w-20 rounded" />
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </section>
  );
}

function SkeletonStats() {
  return (
    <div className="stats-strip w-full max-w-3xl mx-auto mt-10">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="stat-item">
          <Skeleton className="h-7 w-16 mx-auto" />
          <Skeleton className="h-3 w-20 mx-auto mt-2" />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Page Root
// ─────────────────────────────────────────────────────────────────

export default function HalamanUtama() {
  return (
    <div className="relative min-h-screen">
      {/* Background canvas */}
      <BackgroundCanvas />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center w-full px-4 sm:px-6 py-6">
        <BagianHero />

        <Suspense fallback={<SkeletonStats />}>
          <StatsStrip />
        </Suspense>

        <Suspense fallback={<SkeletonAksesCepat />}>
          <BagianAksesCepat />
        </Suspense>

        {/* Bottom spacer */}
        <div className="h-16 sm:h-20" />
      </div>
    </div>
  );
}
