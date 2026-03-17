import { Suspense } from 'react';
import { SearchBar } from '@/components/medical/search-bar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pill, Leaf, FileText, Activity, Search as SearchIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { pencarianGlobal } from '@/services/search-service';
import { Skeleton } from '@/components/ui/skeleton';

async function SearchResults({ query }: { query: string }) {
  if (!query || query.trim().length < 2) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-semibold text-lg">Masukkan Kata Kunci</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Ketik minimal 2 karakter untuk mulai mencari
          </p>
        </CardContent>
      </Card>
    );
  }

  const results = await pencarianGlobal(query, {
    batasPerKategori: 20,
    termasukFuzzy: true,
    skorMinimal: 15,
  });

  if (results.totalResults === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-semibold text-lg">Tidak Ada Hasil</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Tidak ditemukan hasil untuk "{query}"
          </p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            Coba kata kunci lain atau periksa ejaan
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Ditemukan {results.totalResults} hasil untuk "{query}"
      </p>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            Semua ({results.totalResults})
          </TabsTrigger>
          {results.drugs.length > 0 && (
            <TabsTrigger value="drugs" className="text-xs sm:text-sm">
              Obat ({results.drugs.length})
            </TabsTrigger>
          )}
          {results.herbals.length > 0 && (
            <TabsTrigger value="herbals" className="text-xs sm:text-sm">
              Herbal ({results.herbals.length})
            </TabsTrigger>
          )}
          {results.symptoms.length > 0 && (
            <TabsTrigger value="symptoms" className="text-xs sm:text-sm">
              Gejala ({results.symptoms.length})
            </TabsTrigger>
          )}
          {results.notes.length > 0 && (
            <TabsTrigger value="notes" className="text-xs sm:text-sm">
              Catatan ({results.notes.length})
            </TabsTrigger>
          )}
        </TabsList>

        {/* All Results */}
        <TabsContent value="all" className="mt-4 space-y-8">
          {results.drugs.length > 0 && (
            <ResultSection
              title="Obat"
              icon={Pill}
              iconColor="text-sky-600"
              items={results.drugs}
              basePath="/drugs"
            />
          )}
          {results.herbals.length > 0 && (
            <ResultSection
              title="Herbal"
              icon={Leaf}
              iconColor="text-emerald-600"
              items={results.herbals}
              basePath="/herbals"
            />
          )}
          {results.symptoms.length > 0 && (
            <ResultSection
              title="Gejala"
              icon={Activity}
              iconColor="text-amber-600"
              items={results.symptoms}
              basePath="/symptoms"
            />
          )}
          {results.notes.length > 0 && (
            <ResultSection
              title="Catatan Klinis"
              icon={FileText}
              iconColor="text-violet-600"
              items={results.notes}
              basePath="/notes"
            />
          )}
        </TabsContent>

        {/* Category Tabs */}
        <TabsContent value="drugs" className="mt-4">
          <ResultGrid items={results.drugs} basePath="/drugs" />
        </TabsContent>
        <TabsContent value="herbals" className="mt-4">
          <ResultGrid items={results.herbals} basePath="/herbals" />
        </TabsContent>
        <TabsContent value="symptoms" className="mt-4">
          <ResultGrid items={results.symptoms} basePath="/symptoms" />
        </TabsContent>
        <TabsContent value="notes" className="mt-4">
          <ResultGrid items={results.notes} basePath="/notes" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ResultSection({
  title,
  icon: Icon,
  iconColor,
  items,
  basePath,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  items: Array<{ id: string; name: string; description?: string | null; matchType?: string }>;
  basePath: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <h2 className="font-semibold">{title}</h2>
        <Badge variant="secondary">{items.length}</Badge>
      </div>
      <ResultGrid items={items} basePath={basePath} />
    </div>
  );
}

function ResultGrid({
  items,
  basePath,
}: {
  items: Array<{ id: string; name: string; description?: string | null; matchType?: string }>;
  basePath: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`${basePath}/${item.id}`}
          className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="font-medium text-sm">{item.name}</span>
              {item.description && (
                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
              )}
            </div>
            {item.matchType === 'fuzzy' && (
              <Badge variant="outline" className="text-[10px] shrink-0">Mirip</Badge>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Kembali ke Beranda</span>
        <span className="sm:hidden">Kembali</span>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Pencarian</h1>
        <p className="text-sm text-muted-foreground">
          Cari obat, herbal, gejala, dan catatan klinis
        </p>
      </div>

      {/* Search Bar */}
      <SearchBar
        placeholder="Ketik kata kunci..."
        className="w-full"
        autoFocus
      />

      {/* Results */}
      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults query={query} />
      </Suspense>
    </div>
  );
}