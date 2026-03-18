import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { trackView } from '@/lib/actions/track';

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Leaf, 
  AlertTriangle, 
  Shield, 
  Info,
  Heart,
  Share2,
  Baby,
  FlaskConical,
  FileText,
  AlertCircle,
  Trees,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Warna rating keamanan
const warnaKeamanan: Record<string, { bg: string; label: string }> = {
  aman: { bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Aman' },
  'hati-hati': { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: 'Hati-hati' },
  'tidak aman': { bg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', label: 'Tidak Aman' },
  'tidak-aman': { bg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', label: 'Tidak Aman' },
  safe: { bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Safe' },
  caution: { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: 'Caution' },
  unsafe: { bg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', label: 'Unsafe' },
};

// Warna level bukti
const warnaBukti: Record<string, string> = {
  kuat: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  moderat: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  lemah: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  tradisional: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  teoritis: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

// Warna interaksi
const warnaInteraksi: Record<string, string> = {
  mayor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  major: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  moderat: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  moderate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  minor: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
};

// Warna study type
const warnaStudi: Record<string, string> = {
  'meta-analysis': 'bg-emerald-100 text-emerald-700',
  'systematic-review': 'bg-emerald-100 text-emerald-700',
  'RCT-double-blind': 'bg-sky-100 text-sky-700',
  'RCT-single-blind': 'bg-sky-100 text-sky-700',
  'RCT-open-label': 'bg-sky-100 text-sky-700',
  'RCT': 'bg-sky-100 text-sky-700',
  'RCT-kecil': 'bg-sky-50 text-sky-600',
  'cohort-study': 'bg-amber-100 text-amber-700',
  'case-control': 'bg-amber-100 text-amber-700',
  'observasi': 'bg-amber-100 text-amber-700',
  'observational': 'bg-amber-100 text-amber-700',
  'tradisional': 'bg-violet-100 text-violet-700',
};

// Warna kategori
const warnaKategori: Record<string, string> = {
  digestive: 'bg-amber-100 text-amber-700',
  immunity: 'bg-emerald-100 text-emerald-700',
  antiinflammatory: 'bg-rose-100 text-rose-700',
  respiratory: 'bg-cyan-100 text-cyan-700',
  nervous: 'bg-indigo-100 text-indigo-700',
  cardiovascular: 'bg-pink-100 text-pink-700',
  metabolic: 'bg-orange-100 text-orange-700',
  'skin-topical': 'bg-violet-100 text-violet-700',
  urinary: 'bg-teal-100 text-teal-700',
  reproductive: 'bg-pink-100 text-pink-700',
  analgesic: 'bg-emerald-100 text-emerald-700',
};

// Label kategori
const labelKategori: Record<string, string> = {
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

// Parse JSON or comma-separated strings
function parseNames(str: string | null): string[] {
  if (!str) return [];
  // Try JSON parse first
  if (str.startsWith('[')) {
    try {
      return JSON.parse(str);
    } catch {
      return str.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

// Parse regulatory status
function parseRegulatoryStatus(str: string | null): { BPOM?: string; FDA?: string; EMA?: string } | null {
  if (!str) return null;
  if (str.startsWith('{')) {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  }
  return null;
}

// Get label for regulatory status
function getRegulatoryLabel(status: string): string {
  const labels: Record<string, string> = {
    'jamu': 'Jamu',
    'fitofarmaka': 'Fitofarmaka',
    'standardized-herbal': 'Herbal Terstandar',
    'suplemen-kesehatan': 'Suplemen Kesehatan',
    'GRAS': 'GRAS (FDA)',
    'dietary-supplement': 'Dietary Supplement (FDA)',
    'approved-drug': 'Approved Drug (FDA)',
    'traditional-herbal': 'Traditional Herbal (EMA)',
    'well-established-use': 'Well-Established Use (EMA)',
  };
  return labels[status] || status;
}

async function getHerbal(id: string) {
  const herbal = await db.herbal.findUnique({
    where: { id },
    include: {
      compounds: true,
      indications: {
        orderBy: { evidenceLevel: 'asc' },
      },
      interactions: {
        include: {
          interactingDrug: {
            select: { id: true, name: true, genericName: true },
          },
        },
      },
    },
  });

  return herbal;
}

export default async function HerbalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const herbal = await getHerbal(id);

  if (!herbal) {
    notFound();
  }

  // Track view (fire-and-forget)
  trackView('herbal', id).catch(() => {});

  const safetyInfo = herbal.safetyRating 
    ? warnaKeamanan[herbal.safetyRating.toLowerCase()] 
    : null;

  const commonNamesList = parseNames(herbal.commonNames);
  const localNamesList = parseNames(herbal.localNames);
  const regulatoryInfo = parseRegulatoryStatus(herbal.regulatoryStatus);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href="/herbals"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Kembali ke Daftar Herbal</span>
        <span className="sm:hidden">Kembali</span>
      </Link>

      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 shrink-0">
          <Leaf className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{herbal.name}</h1>
              {herbal.latinName && (
                <p className="text-base sm:text-lg text-muted-foreground italic">{herbal.latinName}</p>
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
          <div className="flex flex-wrap gap-2 mt-2">
            {safetyInfo && (
              <Badge className={safetyInfo.bg}>{safetyInfo.label}</Badge>
            )}
            {herbal.category && (
              <Badge className={warnaKategori[herbal.category] || 'bg-gray-100 text-gray-700'}>
                {labelKategori[herbal.category] || herbal.category}
              </Badge>
            )}
            {herbal.plantPart && (
              <Badge variant="outline" className="capitalize">
                {herbal.plantPart}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {herbal.description && (
        <Card className="bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="p-4">
            <p className="text-sm sm:text-base">{herbal.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Common Names & Local Names */}
      {(commonNamesList.length > 0 || localNamesList.length > 0) && (
        <Card>
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base">Nama Lain</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 space-y-3">
            {commonNamesList.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Nama Umum:</p>
                <div className="flex flex-wrap gap-2">
                  {commonNamesList.map((name, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {localNamesList.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Nama Lokal:
                </p>
                <div className="flex flex-wrap gap-2">
                  {localNamesList.map((name, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {herbal.plantFamily && (
          <Card>
            <CardContent className="p-2.5 sm:p-3 text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Famili Tanaman</p>
              <p className="font-medium text-sm sm:text-base flex items-center justify-center gap-1">
                <Trees className="h-3 w-3" />
                {herbal.plantFamily}
              </p>
            </CardContent>
          </Card>
        )}
        {herbal.preparation && (
          <Card>
            <CardContent className="p-2.5 sm:p-3 text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Preparasi</p>
              <p className="font-medium text-xs sm:text-sm">{herbal.preparation}</p>
            </CardContent>
          </Card>
        )}
        {regulatoryInfo && (
          <Card>
            <CardContent className="p-2.5 sm:p-3 text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Status Regulasi</p>
              <div className="flex flex-wrap justify-center gap-1 mt-1">
                {regulatoryInfo.BPOM && (
                  <Badge variant="outline" className="text-[10px]">
                    BPOM: {getRegulatoryLabel(regulatoryInfo.BPOM)}
                  </Badge>
                )}
                {regulatoryInfo.FDA && (
                  <Badge variant="outline" className="text-[10px]">
                    {getRegulatoryLabel(regulatoryInfo.FDA)}
                  </Badge>
                )}
                {regulatoryInfo.EMA && (
                  <Badge variant="outline" className="text-[10px]">
                    {getRegulatoryLabel(regulatoryInfo.EMA)}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        {!regulatoryInfo && herbal.regulatoryStatus && (
          <Card>
            <CardContent className="p-2.5 sm:p-3 text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Status Regulasi</p>
              <p className="font-medium text-xs sm:text-sm">{herbal.regulatoryStatus}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Traditional Use */}
      {herbal.traditionalUse && (
        <Card>
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Info className="h-4 w-4" />
              Penggunaan Tradisional
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{herbal.traditionalUse}</p>
          </CardContent>
        </Card>
      )}

      {/* Safety Info */}
      <Card className="border-emerald-200 dark:border-emerald-900">
        <CardHeader className="pb-2 px-4 sm:px-6">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Shield className="h-4 w-4" />
            Keamanan
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-3">
            {herbal.pregnancySafety && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Kehamilan</p>
                <p className="font-medium text-sm">{herbal.pregnancySafety}</p>
              </div>
            )}
            {herbal.lactationSafety && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Laktasi</p>
                <p className="font-medium text-sm">{herbal.lactationSafety}</p>
              </div>
            )}
            {herbal.pediatricSafety && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Pediatrik</p>
                <p className="font-medium text-sm">{herbal.pediatricSafety}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contraindications */}
      {herbal.contraindications && (
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              Kontraindikasi
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{herbal.contraindications}</p>
          </CardContent>
        </Card>
      )}

      {/* Side Effects */}
      {herbal.sideEffects && (
        <Card className="border-amber-200 dark:border-amber-900">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              Efek Samping
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{herbal.sideEffects}</p>
          </CardContent>
        </Card>
      )}

      {/* Compounds */}
      {herbal.compounds.length > 0 && (
        <Card>
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Kandungan Aktif ({herbal.compounds.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3">
              {herbal.compounds.map((compound) => (
                <div key={compound.id} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="font-medium text-sm">{compound.compoundName}</span>
                      {compound.synonyms && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({compound.synonyms})
                        </span>
                      )}
                      {compound.concentration && (
                        <Badge variant="outline" className="ml-2 text-xs">{compound.concentration}</Badge>
                      )}
                    </div>
                  </div>
                  {compound.pharmacology && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">Farmakologi:</span> {compound.pharmacology}
                    </p>
                  )}
                  {compound.biologicalActivity && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">Aktivitas Biologis:</span> {compound.biologicalActivity}
                    </p>
                  )}
                  {compound.notes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">{compound.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Indications */}
      {herbal.indications.length > 0 && (
        <Card>
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Indikasi ({herbal.indications.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3">
              {herbal.indications.map((ind) => (
                <div key={ind.id} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-medium text-sm">{ind.indication}</span>
                    {ind.evidenceLevel && (
                      <Badge className={cn('text-[10px]', warnaBukti[ind.evidenceLevel.toLowerCase()] || '')}>
                        Bukti: {ind.evidenceLevel}
                      </Badge>
                    )}
                    {ind.studyType && (
                      <Badge className={cn('text-[10px]', warnaStudi[ind.studyType] || 'bg-gray-100 text-gray-700')}>
                        {ind.studyType}
                      </Badge>
                    )}
                  </div>
                  {ind.dosage && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Dosis:</span> {ind.dosage}
                    </div>
                  )}
                  {ind.duration && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Durasi:</span> {ind.duration}
                    </div>
                  )}
                  {ind.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{ind.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactions */}
      {herbal.interactions.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-900">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              Interaksi dengan Obat ({herbal.interactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3">
              {herbal.interactions.map((interaction) => (
                <div key={interaction.id} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    {interaction.interactionType && (
                      <Badge className={cn('text-[10px] capitalize', warnaInteraksi[interaction.interactionType.toLowerCase()] || '')}>
                        {interaction.interactionType}
                      </Badge>
                    )}
                    {interaction.evidenceLevel && (
                      <Badge variant="outline" className="text-[10px]">
                        Bukti: {interaction.evidenceLevel}
                      </Badge>
                    )}
                    {interaction.interactingDrug && (
                      <Link
                        href={`/drugs/${interaction.interactingDrug.id}`}
                        className="font-medium hover:underline text-sm"
                      >
                        {interaction.interactingDrug.name}
                      </Link>
                    )}
                  </div>
                  {interaction.effect && (
                    <p className="text-xs sm:text-sm text-muted-foreground">{interaction.effect}</p>
                  )}
                  {interaction.mechanism && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">Mekanisme:</span> {interaction.mechanism}
                    </p>
                  )}
                  {interaction.management && (
                    <p className="text-xs sm:text-sm mt-1 p-2 rounded bg-amber-50 dark:bg-amber-950/30">
                      <span className="font-medium text-amber-700 dark:text-amber-400">Penatalaksanaan:</span>{' '}
                      <span className="text-amber-600 dark:text-amber-300">{interaction.management}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {herbal.notes && !herbal.notes.includes('Kontraindikasi') && !herbal.notes.includes('Efek Samping') && (
        <Card className="bg-muted/50">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base">Catatan</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{herbal.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* References */}
      {herbal.references && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Referensi:</span> {herbal.references}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}