import { Suspense } from 'react';
import { db } from '@/lib/db';
import { SearchBar } from '@/components/medical/search-bar';
import { QuickAccessCard } from '@/components/medical/quick-access-card';
import { Skeleton } from '@/components/ui/skeleton';

// Ambil jumlah untuk kartu akses cepat
async function ambilJumlahData() {
  const [drugsCount, herbalsCount, notesCount, symptomsCount] = await Promise.all([
    db.drug.count(),
    db.herbal.count(),
    db.clinicalNote.count({ where: { isPublished: true } }),
    db.symptom.count(),
  ]);

  return { drugsCount, herbalsCount, notesCount, symptomsCount };
}

function BagianPencarian() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">MedRef</h1>
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
      title: "Kalkulator Dosis",
      description: "Perhitungan dosis pediatrik",
      href: "/kalkulator",
      icon: "calculator",
      color: "orange" as const,
    },
    {
      title: "Cek Interaksi",
      description: "Periksa interaksi obat",
      href: "/interaksi",
      icon: "alert",
      color: "red" as const,
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
      title: "Catatan Klinis",
      description: "Panduan referensi cepat",
      href: "/notes",
      icon: "file",
      color: "purple" as const,
      count: jumlah.notesCount,
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
      title: "Favorit",
      description: "Item tersimpan Anda",
      href: "/favorites",
      icon: "heart",
      color: "red" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
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
  );
}

function SkeletonAksesCepat() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="flex items-start justify-between">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Skeleton className="h-8 w-8" />
          </div>
          <Skeleton className="h-5 w-28 mt-3" />
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-16 mt-3" />
        </div>
      ))}
    </div>
  );
}

export default function HalamanUtama() {
  return (
    <main className="flex flex-col items-center px-2 sm:px-0 py-8 min-h-screen">
      <BagianPencarian />
      
      <Suspense fallback={<SkeletonAksesCepat />}>
        <BagianAksesCepat />
      </Suspense>
    </main>
  );
}