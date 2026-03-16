import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Pill, 
  AlertTriangle, 
  Clock, 
  Baby,
  Shield,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Warna interaksi
const warnaInteraksi: Record<string, string> = {
  mayor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  moderat: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  minor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

// Warna kehamilan
const warnaKehamilan: Record<string, { bg: string; label: string }> = {
  a: { bg: 'bg-green-100 text-green-700', label: 'A - Aman' },
  b: { bg: 'bg-green-100 text-green-700', label: 'B - Kemungkinan Aman' },
  c: { bg: 'bg-amber-100 text-amber-700', label: 'C - Hati-hati' },
  d: { bg: 'bg-orange-100 text-orange-700', label: 'D - Berbahaya' },
  x: { bg: 'bg-red-100 text-red-700', label: 'X - Kontraindikasi' },
  n: { bg: 'bg-gray-100 text-gray-700', label: 'N - Tidak Diketahui' },
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href="/drugs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Daftar Obat
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30">
          <Pill className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{drug.name}</h1>
          {drug.genericName && (
            <p className="text-lg text-muted-foreground">{drug.genericName}</p>
          )}
          {drug.drugClass && (
            <Badge variant="secondary" className="mt-2 capitalize">
              {drug.drugClass}
            </Badge>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {drug.route && (
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Rute</p>
              <p className="font-medium capitalize">{drug.route}</p>
            </CardContent>
          </Card>
        )}
        {drug.halfLife && (
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Waktu Paruh</p>
              <p className="font-medium">{drug.halfLife}</p>
            </CardContent>
          </Card>
        )}
        {pregnancyInfo && (
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Kategori Hamil</p>
              <Badge className={cn('mt-1', pregnancyInfo.bg)}>
                {pregnancyInfo.label}
              </Badge>
            </CardContent>
          </Card>
        )}
        {drug.lactation && (
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Laktasi</p>
              <p className="font-medium text-sm">{drug.lactation}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mechanism */}
      {drug.mechanism && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4" />
              Mekanisme Kerja
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{drug.mechanism}</p>
          </CardContent>
        </Card>
      )}

      {/* Doses */}
      {drug.doses.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Dosis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {drug.doses.map((dose, index) => (
              <div key={dose.id}>
                {index > 0 && <Separator className="my-4" />}
                {dose.indication && (
                  <p className="font-medium text-sm mb-2">{dose.indication}</p>
                )}
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Dewasa:</p>
                    <p>{dose.adultDose}</p>
                  </div>
                  {dose.pediatricDose && (
                    <div>
                      <p className="text-muted-foreground">Anak:</p>
                      <p>{dose.pediatricDose}</p>
                    </div>
                  )}
                  {dose.maxDose && (
                    <div>
                      <p className="text-muted-foreground">Dosis Maks:</p>
                      <p>{dose.maxDose} {dose.maxDoseUnit}</p>
                    </div>
                  )}
                  {dose.frequency && (
                    <div>
                      <p className="text-muted-foreground">Frekuensi:</p>
                      <p>{dose.frequency}</p>
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
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Indikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {drug.indications.map((ind) => (
                <Badge key={ind.id} variant="secondary">
                  {ind.indication}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contraindications */}
      {drug.contraindications.length > 0 && (
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-red-600 dark:text-red-400">
              <Shield className="h-4 w-4" />
              Kontraindikasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {drug.contraindications.map((contra) => (
                <li key={contra.id} className="flex items-start gap-2 text-sm">
                  <span className={cn(
                    'px-1.5 py-0.5 rounded text-xs',
                    contra.severity === 'absolut' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-amber-100 text-amber-700'
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
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              Interaksi Obat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {drug.interactions.map((interaction) => (
                <div 
                  key={interaction.id} 
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <Badge 
                    className={cn(
                      'capitalize',
                      warnaInteraksi[interaction.interactionType?.toLowerCase() || 'minor']
                    )}
                  >
                    {interaction.interactionType || 'Minor'}
                  </Badge>
                  <div className="flex-1">
                    <Link
                      href={`/drugs/${interaction.interactingDrug.id}`}
                      className="font-medium hover:underline"
                    >
                      {interaction.interactingDrug.name}
                    </Link>
                    {interaction.effect && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {interaction.effect}
                      </p>
                    )}
                    {interaction.management && (
                      <p className="text-sm mt-1">
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
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Catatan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {drug.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}