import { Suspense } from 'react';
import { db } from '@/lib/db';
import { NoteCard } from '@/components/medical';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

async function NoteList({ kategori }: { kategori?: string }) {
  const where: Record<string, unknown> = { isPublished: true };

  if (kategori) {
    where.category = kategori;
  }

  const notes = await db.clinicalNote.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}

async function KategoriFilter() {
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
        <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10">
          Semua
        </Badge>
      </a>
      {kategoriList.map((kategori) => (
        <a key={kategori} href={`/notes?kategori=${encodeURIComponent(kategori)}`}>
          <Badge 
            variant="secondary" 
            className="cursor-pointer hover:bg-primary/10 capitalize"
          >
            {kategori}
          </Badge>
        </a>
      ))}
    </div>
  );
}

export default function NotesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Catatan Klinis</h1>
        <p className="text-muted-foreground">
          Referensi cepat dan panduan klinis
        </p>
      </div>

      <Suspense fallback={<div className="h-8" />}>
        <KategoriFilter />
      </Suspense>

      <Suspense fallback={<div className="text-center py-8">Memuat...</div>}>
        <NoteList />
      </Suspense>
    </div>
  );
}