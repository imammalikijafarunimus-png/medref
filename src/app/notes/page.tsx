import { Suspense } from 'react';
import { db } from '@/lib/db';
import { NoteCard } from '@/components/medical';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { NotePagination } from './NotePagination';

const ITEMS_PER_PAGE = 25;

async function NoteList({ kategori, page, limit }: { kategori?: string; page: number; limit: number }) {
  const where: Record<string, unknown> = { isPublished: true };

  if (kategori) {
    where.category = kategori;
  }

  const [notes, totalItems] = await Promise.all([
    db.clinicalNote.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.clinicalNote.count({ where }),
  ]);

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold text-lg">Tidak Ada Catatan</h3>
        <p className="text-muted-foreground mt-1">
          Belum ada catatan klinis tersedia
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>

      <NotePagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={limit}
        kategori={kategori}
      />
    </div>
  );
}

async function KategoriFilter({ activeKategori }: { activeKategori?: string }) {
  const result = await db.clinicalNote.findMany({
    where: { isPublished: true },
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  });

  const kategoriList = result.map((r) => r.category);

  return (
    <div className="flex flex-wrap gap-2">
      <a href="/notes">
        <Badge
          variant={!activeKategori ? 'default' : 'secondary'}
          className="cursor-pointer hover:bg-primary/10"
        >
          Semua
        </Badge>
      </a>
      {kategoriList.map((kategori) => (
        <a key={kategori} href={`/notes?kategori=${encodeURIComponent(kategori)}`}>
          <Badge
            variant={activeKategori === kategori ? 'default' : 'secondary'}
            className="cursor-pointer hover:bg-primary/10 capitalize"
          >
            {kategori}
          </Badge>
        </a>
      ))}
    </div>
  );
}

async function NoteListWrapper({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; page?: string; limit?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1') || 1);
  const limit = Math.max(1, Math.min(100, parseInt(params.limit || String(ITEMS_PER_PAGE)) || ITEMS_PER_PAGE));
  
  return <NoteList kategori={params.kategori} page={page} limit={limit} />;
}

async function KategoriFilterWrapper({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const params = await searchParams;
  return <KategoriFilter activeKategori={params.kategori} />;
}

export default function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; page?: string; limit?: string }>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Catatan Klinis</h1>
        <p className="text-muted-foreground">
          Referensi cepat dan panduan klinis
        </p>
      </div>

      <Suspense fallback={<div className="h-8" />}>
        <KategoriFilterWrapper searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<div className="text-center py-8">Memuat...</div>}>
        <NoteListWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}