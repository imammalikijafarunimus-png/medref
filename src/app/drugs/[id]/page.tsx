import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Pill, 
  AlertTriangle, 
  Clock, 
  Baby,
  Shield,
  Info,
  Heart,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Warna interaksi
const warnaInteraksi: Record<string, string> = {
  mayor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  moderat: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  minor: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
};

// Warna kehamilan
const warnaKehamilan: Record<string, { bg: string; label: string }> = {
  a: { bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'A - Aman' },
  b: { bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'B - Kemungkinan Aman' },
  c: { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: 'C - Hati-hati' },
  d: { bg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', label: 'D - Berbahaya' },
  x: { bg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'X - Kontraindikasi' },
  n: { bg: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', label: 'N - Tidak Diketahui' },
};

async function getDrug(id: string) {
  const drug = await db.drug.findUnique({
    where: { id },
    include: {
      doses: {
        orderBy: { createdAt: 'asc' },
      },
      indications: {
        orderBy: { priority: 'desc' },
      },
      contraindications: {
        orderBy: { severity: 'asc' },
      },
      interactions: {
        include: {
          interactingDrug: {
            select: { id: true, name: true, genericName: true },
          },
        },
        orderBy: { interactionType: 'asc' },
      },
    },
  });

  return drug;
}

export default async function DrugDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const drug = await getDrug(id);

  if (!drug) {
    notFound();
  }

  const pregnancyInfo = drug.pregnancyCat 
    ? warnaKehamilan[drug.pregnancyCat.toLowerCase()] 
    : null;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href="/drugs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Kembali ke Daftar Obat</span>
        <span className="sm:hidden">Kembali</span>
      </Link>

      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="p-2.5 sm:p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 shrink-0">
          <Pill className="h-6 w-6 sm:h-8 sm:w-8 text-sky-600 dark:text-sky-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{drug.name}</h1>
              {drug.genericName && (
                <p className="text-base sm:text-lg text-muted-foreground">{drug.genericName}</p>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {drug.drugClass && (
            <Badge variant="secondary" className="mt-2 capitalize">
              {drug.drugClass}
            </Badge>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {drug.route && (
          <Card>
            <CardContent className="p-2.5 sm:p-3 text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Rute</p>
              <p className="font-medium text-sm sm:text-base capitalize">{drug.route}</p>
            </CardContent>
          </Card>
        )}
        {drug.halfLife && (
          <Card>
            <CardContent className="p-2.5 sm:p-3 text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Waktu Paruh</p>
              <p className="font-medium text-sm sm:text-base">{drug.halfLife}</p>
            </CardContent>
          </Card>
        )}
        {pregnancyInfo && (
          <Card>
            <CardContent className="p-2.5 sm:p-3 text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Kategori Hamil</p>
              <Badge className={cn('mt-1 text-[10px] sm:text-xs', pregnancyInfo.bg)}>
                {pregnancyInfo.label}
              </Badge>
            </CardContent>
          </Card>
        )}
        {drug.lactation && (
          <Card>
            <CardContent className="p-2.5 sm:p-3 text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Laktasi</p>
              <p className="font-medium text-xs sm:text-sm">{drug.lactation}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mechanism */}
      {drug.mechanism && (
        <Card>
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Info className="h-4 w-4" />
              Mekanisme Kerja
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <p className="text-sm text-muted-foreground">{drug.mechanism}</p>
          </CardContent>
        </Card>
      )}

      {/* Doses */}
      {drug.doses.length > 0 && (
        <Card>
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Dosis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            {drug.doses.map((dose, index) => (
              <div key={dose.id}>
                {index > 0 && <Separator className="my-4" />}
                {dose.indication && (
                  <p className="font-medium text-sm mb-2">{dose.indication}</p>
                )}
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground text-xs">Dewasa:</p>
                    <p className="font-medium">{dose.adultDose}</p>
                  </div>
                  {dose.pediatricDose && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-muted-foreground text-xs">Anak:</p>
                      <p className="font-medium">{dose.pediatricDose}</p>
                    </div>
                  )}
                  {dose.maxDose && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-muted-foreground text-xs">Dosis Maks:</p>
                      <p className="font-medium">{dose.maxDose} {dose.maxDoseUnit}</p>
                    </div>
                  )}
                  {dose.frequency && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-muted-foreground text-xs">Frekuensi:</p>
                      <p className="font-medium">{dose.frequency}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Indications */}
      {drug.indications.length > 0 && (
        <Card>
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base">Indikasi</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="flex flex-wrap gap-2">
              {drug.indications.map((ind) => (
                <Badge key={ind.id} variant="secondary" className="text-xs sm:text-sm">
                  {ind.indication}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contraindications */}
      {drug.contraindications.length > 0 && (
        <Card className="border-rose-200 dark:border-rose-900">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <Shield className="h-4 w-4" />
              Kontraindikasi
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <ul className="space-y-2">
              {drug.contraindications.map((contra) => (
                <li key={contra.id} className="flex items-start gap-2 text-sm">
                  <span className={cn(
                    'px-1.5 py-0.5 rounded text-[10px] sm:text-xs shrink-0 mt-0.5',
                    contra.severity === 'absolut' 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  )}>
                    {contra.severity || 'Relatif'}
                  </span>
                  <span>{contra.contraindication}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Interactions */}
      {drug.interactions.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-900">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              Interaksi Obat
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3">
              {drug.interactions.map((interaction) => (
                <div 
                  key={interaction.id} 
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <Badge 
                    className={cn(
                      'capitalize shrink-0 text-[10px] sm:text-xs',
                      warnaInteraksi[interaction.interactionType?.toLowerCase() || 'minor']
                    )}
                  >
                    {interaction.interactionType || 'Minor'}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/drugs/${interaction.interactingDrug.id}`}
                      className="font-medium hover:underline text-sm sm:text-base"
                    >
                      {interaction.interactingDrug.name}
                    </Link>
                    {interaction.effect && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {interaction.effect}
                      </p>
                    )}
                    {interaction.management && (
                      <p className="text-xs sm:text-sm mt-1">
                        <span className="font-medium">Penatalaksanaan:</span>{' '}
                        {interaction.management}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {drug.notes && (
        <Card>
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base">Catatan</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {drug.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}