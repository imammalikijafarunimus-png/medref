import { Suspense } from 'react';
import { db } from '@/lib/db';

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';
import { DrugCard, DrugListSkeleton } from '@/components/medical';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pill, Search } from 'lucide-react';
import { DrugPagination } from './DrugPagination';

const ITEMS_PER_PAGE = 25;

async function DrugList({
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
      { genericName: { contains: search, mode: 'insensitive' } },
      { brandNames: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [drugs, totalItems] = await Promise.all([
    db.drug.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        doses: { take: 1 },
        indications: { take: 3, orderBy: { priority: 'desc' } },
        _count: {
          select: { interactions: true, contraindications: true },
        },
      },
    }),
    db.drug.count({ where }),
  ]);

  if (drugs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-4">
          <Pill className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg">Tidak Ada Obat</h3>
        <p className="text-muted-foreground mt-1 text-sm px-4">
          {search || kategori
            ? 'Tidak ditemukan obat dengan filter tersebut'
            : 'Database obat masih kosong'}
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {drugs.map((drug) => (
          <DrugCard key={drug.id} drug={drug} />
        ))}
      </div>

      <DrugPagination
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
  const result = await db.drug.findMany({
    where: { category: { not: null } },
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  });

  const kategoriList = result
    .map((r) => r.category)
    .filter((k): k is string => k !== null);

  if (kategoriList.length === 0) return null;

  // Label untuk kategori
  const labelMap: Record<string, string> = {
    analgesic: 'Analgesik',
    antibiotic: 'Antibiotik',
    antiviral: 'Antiviral',
    antifungal: 'Antijamur',
    cardiovascular: 'Kardiovaskular',
    diuretic: 'Diuretik',
    anticoagulant: 'Antikoagulan',
    antiarrhythmic: 'Antiarritmia',
    'lipid-lowering': 'Penurun Lipid',
    antianginal: 'Antiangina',
    endocrine: 'Endokrin',
    respiratory: 'Respirasi',
    neurology: 'Neurologi',
    psychiatry: 'Psikiatri',
    gastrointestinal: 'Gastrointestinal',
    dermatology: 'Dermatologi',
    antimigraine: 'Antimigrain',
    antigout: 'Antigout',
    antihistamine: 'Antihistamin',
    antidiabetic: 'Antidiabetes',
    thyroid: 'Tiroid',
    corticosteroid: 'Kortikosteroid',
    urology: 'Urologi',
    gynecology: 'Ginekologi',
    'vitamin-supplement': 'Vitamin & Suplemen',
    'otc-general': 'Obat Bebas',
  };

  return (
    <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      <a href="/drugs">
        <Badge
          variant={!activeKategori ? 'default' : 'secondary'}
          className="cursor-pointer hover:bg-primary/10 whitespace-nowrap px-3 py-1.5"
        >
          Semua
        </Badge>
      </a>
      {kategoriList.map((kategori) => (
        <a key={kategori} href={`/drugs?kategori=${encodeURIComponent(kategori)}`}>
          <Badge
            variant={activeKategori === kategori ? 'default' : 'secondary'}
            className="cursor-pointer hover:bg-primary/10 whitespace-nowrap px-3 py-1.5"
          >
            {labelMap[kategori] || kategori}
          </Badge>
        </a>
      ))}
    </div>
  );
}

async function DrugListWrapper({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; kategori?: string; page?: string; limit?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1') || 1);
  const limit = Math.max(1, Math.min(100, parseInt(params.limit || String(ITEMS_PER_PAGE)) || ITEMS_PER_PAGE));
  
  return (
    <DrugList
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

export default function DrugsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; kategori?: string; page?: string; limit?: string }>;
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Database Obat</h1>
          <p className="text-sm text-muted-foreground">
            Cari informasi obat, dosis, interaksi, dan kontraindikasi
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Cari nama obat, generik, atau merek..."
            defaultValue=""
            className="w-full pl-10 h-11"
          />
        </form>
      </div>

      {/* Filter by Category */}
      <Suspense fallback={<div className="h-10" />}>
        <KategoriFilterWrapper searchParams={searchParams} />
      </Suspense>

      {/* Drug List */}
      <Suspense fallback={<DrugListSkeleton count={9} />}>
        <DrugListWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}