import { Suspense } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, ChevronRight } from 'lucide-react';
import { SymptomPagination } from './SymptomPagination';

const ITEMS_PER_PAGE = 25;

async function SymptomList({ page, limit }: { page: number; limit: number }) {
  const [symptoms, totalItems] = await Promise.all([
    db.symptom.findMany({
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: { drugMappings: true },
        },
      },
    }),
    db.symptom.count(),
  ]);

  if (symptoms.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold text-lg">Tidak Ada Gejala</h3>
        <p className="text-muted-foreground mt-1">
          Database gejala masih kosong
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {symptoms.map((symptom) => (
          <Link key={symptom.id} href={`/symptoms/${symptom.id}`}>
            <Card className="transition-all duration-200 hover:shadow-md hover:border-primary/20 cursor-pointer h-full">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex-shrink-0">
                      <Activity className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{symptom.name}</h3>
                      {symptom.category && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {symptom.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                </div>
                
                {symptom.description && (
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                    {symptom.description}
                  </p>
                )}

                <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {symptom._count.drugMappings} rekomendasi obat
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <SymptomPagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={limit}
      />
    </div>
  );
}

async function SymptomListWrapper({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1') || 1);
  const limit = Math.max(1, Math.min(100, parseInt(params.limit || String(ITEMS_PER_PAGE)) || ITEMS_PER_PAGE));
  
  return <SymptomList page={page} limit={limit} />;
}

export default function SymptomsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Panduan Gejala</h1>
        <p className="text-muted-foreground">
          Cari obat berdasarkan gejala yang dialami
        </p>
      </div>

      <Suspense fallback={<div className="text-center py-8">Memuat...</div>}>
        <SymptomListWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}