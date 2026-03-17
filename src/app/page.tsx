import { Suspense } from 'react';
import { ambilJumlahData } from '@/lib/data';
import { SearchBar } from '@/components/medical/search-bar';
import { QuickAccessCard } from '@/components/medical/quick-access-card';
import { Skeleton } from '@/components/ui/skeleton';

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';

function BagianPencarian() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-teal-500 bg-clip-text text-transparent">
          MedRef
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Sistem Referensi Klinis Personal
        </p>
      </div>
      <SearchBar
        placeholder="Cari obat, herbal, gejala, catatan klinis..."
        className="w-full"
        autoFocus={false}
      />
    </div>
  );
}

async function BagianAksesCepat() {
  const jumlah = await ambilJumlahData();

  // 8 cards for 2 rows of 4
  const menuAksesCepat = [
    {
      title: "Database Obat",
      description: "Cari obat, dosis, interaksi",
      href: "/drugs",
      icon: "pill",
      color: "blue" as const,
      count: jumlah.drugsCount,
    },
    {
      title: "Cek Interaksi",
      description: "Periksa interaksi obat",
      href: "/interaksi",
      icon: "alert",
      color: "red" as const,
    },
    {
      title: "Kalkulator Medis",
      description: "Dosis, BMI, GFR, kalori",
      href: "/kalkulator",
      icon: "calculator",
      color: "orange" as const,
    },
    {
      title: "Nilai Normal Lab",
      description: "Referensi nilai laboratorium",
      href: "/lab-values",
      icon: "beaker",
      color: "cyan" as const,
    },
    {
      title: "Obat Herbal",
      description: "Referensi herbal berbasis bukti",
      href: "/herbals",
      icon: "leaf",
      color: "green" as const,
      count: jumlah.herbalsCount,
    },
    {
      title: "Panduan Gejala",
      description: "Cari obat berdasarkan gejala",
      href: "/symptoms",
      icon: "stethoscope",
      color: "teal" as const,
      count: jumlah.symptomsCount,
    },
    {
      title: "Catatan Klinis",
      description: "Panduan referensi cepat",
      href: "/notes",
      icon: "file",
      color: "purple" as const,
      count: jumlah.notesCount,
    },
    {
      title: "Favorit",
      description: "Item tersimpan Anda",
      href: "/favorites",
      icon: "heart",
      color: "red" as const,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto mt-6 sm:mt-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {menuAksesCepat.map((item) => (
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

function SkeletonAksesCepat() {
  return (
    <div className="w-full max-w-5xl mx-auto mt-6 sm:mt-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-5 w-5" />
            </div>
            <Skeleton className="h-4 w-24 mt-3" />
            <Skeleton className="h-3 w-full mt-2" />
            <Skeleton className="h-3 w-12 mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HalamanUtama() {
  return (
    <div className="flex flex-col items-center w-full">
      <BagianPencarian />
      
      <Suspense fallback={<SkeletonAksesCepat />}>
        <BagianAksesCepat />
      </Suspense>
    </div>
  );
}