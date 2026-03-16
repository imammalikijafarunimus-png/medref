import { Suspense } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { HerbalCard, HerbalListSkeleton } from '@/components/medical';
import { Input } from '@/components/ui/input';
import { Leaf } from 'lucide-react';

async function HerbalList({ search }: { search?: string }) {
  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { latinName: { contains: search, mode: 'insensitive' } },
      { commonNames: { contains: search, mode: 'insensitive' } },
    ];
  }

  const herbals = await db.herbal.findMany({
    where,
    orderBy: { name: 'asc' },
    take: 50,
    include: {
      indications: { take: 3 },
    },
  });

  if (herbals.length === 0) {
    return (
      <div className="text-center py-12">
        <Leaf className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold text-lg">Tidak Ada Herbal</h3>
        <p className="text-muted-foreground mt-1">
          {search 
            ? 'Tidak ditemukan herbal dengan pencarian tersebut'
            : 'Database herbal masih kosong'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {herbals.map((herbal) => (
        <HerbalCard key={herbal.id} herbal={herbal} />
      ))}
    </div>
  );
}

export default function HerbalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Obat Herbal</h1>
          <p className="text-muted-foreground">
            Referensi herbal berbasis bukti ilmiah
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Cari nama herbal atau nama latin..."
          className="w-full"
        />
      </div>

      {/* Herbal List */}
      <Suspense fallback={<HerbalListSkeleton count={9} />}>
        <HerbalList />
      </Suspense>
    </div>
  );
}