import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Activity, 
  Pill,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

async function getSymptom(id: string) {
  const symptom = await db.symptom.findUnique({
    where: { id },
    include: {
      drugMappings: {
        include: {
          drug: {
            select: {
              id: true,
              name: true,
              genericName: true,
              drugClass: true,
            },
          },
        },
        orderBy: [
          { isFirstLine: 'desc' },
          { priority: 'desc' },
        ],
      },
      _count: {
        select: { drugMappings: true },
      },
    },
  });

  return symptom;
}

export default async function SymptomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const symptom = await getSymptom(id);

  if (!symptom) {
    notFound();
  }

  // Group drugs by first line
  const firstLineDrugs = symptom.drugMappings.filter(m => m.isFirstLine);
  const otherDrugs = symptom.drugMappings.filter(m => !m.isFirstLine);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href="/symptoms"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Kembali ke Panduan Gejala</span>
        <span className="sm:hidden">Kembali</span>
      </Link>

      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="p-2.5 sm:p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 shrink-0">
          <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold">{symptom.name}</h1>
          {symptom.category && (
            <Badge variant="secondary" className="mt-2 capitalize">
              {symptom.category}
            </Badge>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            {symptom._count.drugMappings} obat terkait
          </p>
        </div>
      </div>

      {/* Description */}
      {symptom.description && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{symptom.description}</p>
          </CardContent>
        </Card>
      )}

      {/* First Line Drugs */}
      {firstLineDrugs.length > 0 && (
        <Card className="border-emerald-200 dark:border-emerald-900">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              Obat Lini Pertama
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-2">
              {firstLineDrugs.map((mapping) => (
                <Link
                  key={mapping.id}
                  href={`/drugs/${mapping.drug.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 shrink-0">
                    <Pill className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{mapping.drug.name}</p>
                    {mapping.drug.genericName && (
                      <p className="text-xs text-muted-foreground">{mapping.drug.genericName}</p>
                    )}
                    {mapping.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{mapping.notes}</p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Drugs */}
      {otherDrugs.length > 0 && (
        <Card>
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base">Obat Alternatif</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-2">
              {otherDrugs.map((mapping) => (
                <Link
                  key={mapping.id}
                  href={`/drugs/${mapping.drug.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-muted shrink-0">
                    <Pill className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{mapping.drug.name}</p>
                    {mapping.drug.genericName && (
                      <p className="text-xs text-muted-foreground">{mapping.drug.genericName}</p>
                    )}
                    {mapping.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{mapping.notes}</p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {symptom.drugMappings.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <Pill className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg">Belum Ada Obat Terkait</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Gejala ini belum memiliki rekomendasi obat
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}