import { Suspense } from 'react';
import { db } from '@/lib/db';

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';
import { HerbalCard, HerbalListSkeleton } from '@/components/medical';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Leaf, Search } from 'lucide-react';
import { HerbalPagination } from './HerbalPagination';

const ITEMS_PER_PAGE = 25;

async function HerbalList({
  search,
  kategori,
  page,
  limit,
}: {
  search?: string;
  kategori?: string;
  page: number;
  limit: number;
}) {
  const where: Record<string, unknown> = {};

  if (kategori) {
    where.category = kategori;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { latinName: { contains: search, mode: 'insensitive' } },
      { commonNames: { contains: search, mode: 'insensitive' } },
      { localNames: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [herbals, totalItems] = await Promise.all([
    db.herbal.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        indications: { take: 3 },
        compounds: { take: 1 },
        interactions: true,
      },
    }),
    db.herbal.count({ where }),
  ]);

  if (herbals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-4">
          <Leaf className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg">Tidak Ada Herbal</h3>
        <p className="text-muted-foreground mt-1 text-sm px-4">
          {search || kategori
            ? 'Tidak ditemukan herbal dengan filter tersebut'
            : 'Database herbal masih kosong'}
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {herbals.map((herbal) => (
          <HerbalCard key={herbal.id} herbal={herbal} />
        ))}
      </div>

      <HerbalPagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={limit}
        search={search}
        kategori={kategori}
      />
    </div>
  );
}

async function KategoriFilter({ activeKategori }: { activeKategori?: string }) {
  // Get distinct categories for filter
  const result = await db.herbal.findMany({
    where: { category: { not: null } },
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  });

  const kategoriList = result
    .map((r) => r.category)
    .filter((k): k is string => k !== null);

  if (kategoriList.length === 0) return null;

  // Map for display labels
  const labelMap: Record<string, string> = {
    digestive: 'Pencernaan',
    immunity: 'Imunitas',
    antiinflammatory: 'Antiinflamasi',
    respiratory: 'Respirasi',
    nervous: 'Saraf',
    cardiovascular: 'Kardiovaskular',
    metabolic: 'Metabolik',
    'skin-topical': 'Kulit',
    urinary: 'Urinari',
    reproductive: 'Reproduksi',
    analgesic: 'Analgesik',
  };

  return (
    <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      <a href="/herbals">
        <Badge
          variant={!activeKategori ? 'default' : 'secondary'}
          className="cursor-pointer hover:bg-primary/10 whitespace-nowrap px-3 py-1.5"
        >
          Semua
        </Badge>
      </a>
      {kategoriList.map((kategori) => (
        <a key={kategori} href={`/herbals?kategori=${encodeURIComponent(kategori)}`}>
          <Badge
            variant={activeKategori === kategori ? 'default' : 'secondary'}
            className="cursor-pointer hover:bg-primary/10 capitalize whitespace-nowrap px-3 py-1.5"
          >
            {labelMap[kategori] || kategori}
          </Badge>
        </a>
      ))}
    </div>
  );
}

async function HerbalListWrapper({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; kategori?: string; page?: string; limit?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1') || 1);
  const limit = Math.max(1, Math.min(100, parseInt(params.limit || String(ITEMS_PER_PAGE)) || ITEMS_PER_PAGE));
  
  return (
    <HerbalList
      search={params.search}
      kategori={params.kategori}
      page={page}
      limit={limit}
    />
  );
}

async function KategoriFilterWrapper({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const params = await searchParams;
  return <KategoriFilter activeKategori={params.kategori} />;
}

export default function HerbalsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; kategori?: string; page?: string; limit?: string }>;
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Obat Herbal</h1>
          <p className="text-sm text-muted-foreground">
            Referensi herbal berbasis bukti ilmiah dengan informasi keamanan dan interaksi
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Cari nama herbal, nama latin, atau nama umum..."
            defaultValue=""
            className="w-full pl-10 h-11"
          />
        </form>
      </div>

      {/* Filter by Category */}
      <Suspense fallback={<div className="h-10" />}>
        <KategoriFilterWrapper searchParams={searchParams} />
      </Suspense>

      {/* Herbal List */}
      <Suspense fallback={<HerbalListSkeleton count={9} />}>
        <HerbalListWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}