import { Suspense } from 'react';
import { db } from '@/lib/db';
import { DrugCard, DrugListSkeleton } from '@/components/medical';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pill } from 'lucide-react';

async function DrugList({ search, kelas }: { search?: string; kelas?: string }) {
  const where: Record<string, unknown> = {};

  if (kelas) {
    where.drugClass = kelas;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { genericName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const drugs = await db.drug.findMany({
    where,
    orderBy: { name: 'asc' },
    take: 50,
    include: {
      doses: { take: 1 },
      indications: { take: 3, orderBy: { priority: 'desc' } },
      _count: {
        select: { interactions: true, contraindications: true },
      },
    },
  });

  if (drugs.length === 0) {
    return (
      <div className="text-center py-12">
        <Pill className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold text-lg">Tidak Ada Obat</h3>
        <p className="text-muted-foreground mt-1">
          {search || kelas 
            ? 'Tidak ditemukan obat dengan filter tersebut'
            : 'Database obat masih kosong'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {drugs.map((drug) => (
        <DrugCard key={drug.id} drug={drug} />
      ))}
    </div>
  );
}

async function KelasFilter() {
  const result = await db.drug.findMany({
    where: { drugClass: { not: null } },
    select: { drugClass: true },
    distinct: ['drugClass'],
    orderBy: { drugClass: 'asc' },
  });

  const kelasList = result
    .map((r) => r.drugClass)
    .filter((k): k is string => k !== null);

  return (
    <div className="flex flex-wrap gap-2">
      <a href="/drugs">
        <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10">
          Semua
        </Badge>
      </a>
      {kelasList.map((kelas) => (
        <a key={kelas} href={`/drugs?kelas=${encodeURIComponent(kelas)}`}>
          <Badge 
            variant="secondary" 
            className="cursor-pointer hover:bg-primary/10 capitalize"
          >
            {kelas}
          </Badge>
        </a>
      ))}
    </div>
  );
}

export default function DrugsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; kelas?: string }>;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Database Obat</h1>
          <p className="text-muted-foreground">
            Cari informasi obat, dosis, interaksi, dan kontraindikasi
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form className="flex-1 max-w-md">
          <Input
            name="search"
            placeholder="Cari nama obat..."
            defaultValue=""
            className="w-full"
          />
        </form>
      </div>

      <Suspense fallback={<div className="h-8" />}>
        <KelasFilter />
      </Suspense>

      {/* Drug List */}
      <Suspense fallback={<DrugListSkeleton count={9} />}>
        <DrugList />
      </Suspense>
    </div>
  );
}