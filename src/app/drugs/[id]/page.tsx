import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { trackView } from '@/lib/actions/track';

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { FavoriteButton } from '@/components/favorite-button'; // <-- TAMBAHKAN INI
import { 
  ArrowLeft, 
  Pill, 
  AlertTriangle, 
  Clock, 
  Baby,
  Shield,
  Info,
  Share2, // Heart sudah dihapus karena pindah ke komponen sendiri
  FileText,
  Droplets,
  Thermometer,
  Package,
  AlertOctagon,
  Activity,
  BookOpen,
  Microscope,
  ClipboardList,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Warna interaksi
const warnaInteraksi: Record<string, string> = {
  mayor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  major: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  moderat: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  moderate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
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

// Label kategori obat
const labelKategori: Record<string, string> = {
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

// Parse brand names from comma-separated string
function parseBrandNames(brandNames: string | null): string[] {
  if (!brandNames) return [];
  return brandNames.split(',').map(b => b.trim()).filter(Boolean);
}

// Parse regulatory status
function parseRegulatoryStatus(str: string | null): { BPOM?: string; FDA?: string; JKN?: string } | null {
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
    'obat-keras': 'Obat Keras',
    'obat-bebas': 'Obat Bebas',
    'obat-bebas-terbatas': 'Obat Bebas Terbatas',
    'fitofarmaka': 'Fitofarmaka',
    'jamu': 'Jamu',
    'approved': 'FDA Approved',
    'formularium': 'JKN Formularium',
    'non-formularium': 'Non-Formularium JKN',
  };
  return labels[status] || status;
}

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

  // Track view (fire-and-forget)
  trackView('drug', id).catch(() => {});

  const pregnancyInfo = drug.pregnancyCat 
    ? warnaKehamilan[drug.pregnancyCat.toLowerCase()] 
    : null;

  const brandNamesList = parseBrandNames(drug.brandNames);
  const regulatoryInfo = parseRegulatoryStatus(drug.regulatoryStatus);

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
              {/* <-- GANTI TOMBOL HEART LAMA DENGAN INI */}
              <FavoriteButton itemId={drug.id} itemName={drug.name} itemType="drug" />
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {drug.category && (
              <Badge variant="default" className="text-xs">
                {labelKategori[drug.category] || drug.category}
              </Badge>
            )}
            {drug.drugClass && (
              <Badge variant="secondary" className="text-xs">
                {drug.drugClass}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Black Box Warning */}
      {drug.blackBoxWarning && (
        <Card className="border-black bg-black/5 dark:bg-black/20">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertOctagon className="h-5 w-5 text-black dark:text-white shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-black dark:text-white mb-1">
                  PERINGATAN KHUSUS (Black Box Warning)
                </p>
                <p className="text-sm text-black/80 dark:text-white/80 whitespace-pre-wrap">
                  {drug.blackBoxWarning}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {drug.description && (
        <Card className="bg-sky-50/50 dark:bg-sky-950/20">
          <CardContent className="p-4">
            <p className="text-sm sm:text-base">{drug.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Brand Names */}
      {brandNamesList.length > 0 && (
        <Card>
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Nama Dagang
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="flex flex-wrap gap-2">
              {brandNamesList.map((brand, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {brand}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regulatory Status */}
      {regulatoryInfo && (
        <Card>
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Status Regulasi
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="flex flex-wrap gap-2">
              {regulatoryInfo.BPOM && (
                <Badge variant="outline" className="text-xs">
                  BPOM: {getRegulatoryLabel(regulatoryInfo.BPOM)}
                </Badge>
              )}
              {regulatoryInfo.FDA && (
                <Badge variant="outline" className="text-xs">
                  {getRegulatoryLabel(regulatoryInfo.FDA)}
                </Badge>
              )}
              {regulatoryInfo.JKN && (
                <Badge variant="outline" className="text-xs">
                  {getRegulatoryLabel(regulatoryInfo.JKN)}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {drug.route && (
          <Card>
            <CardContent className="p-2.5 sm:p-3 text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Rute</p>
              <p className="font-medium text-sm sm:text-base">{drug.route}</p>
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

      {/* Pharmacokinetics */}
      {(drug.bioavailability || drug.proteinBinding || drug.metabolism || drug.excretion) && (
        <Card>
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Microscope className="h-4 w-4" />
              Farmakokinetik
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid sm:grid-cols-2 gap-3">
              {drug.bioavailability && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Bioavailabilitas</p>
                  <p className="text-sm font-medium">{drug.bioavailability}</p>
                </div>
              )}
              {drug.proteinBinding && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Ikatan Protein</p>
                  <p className="text-sm font-medium">{drug.proteinBinding}</p>
                </div>
              )}
              {drug.metabolism && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Metabolisme</p>
                  <p className="text-sm font-medium">{drug.metabolism}</p>
                </div>
              )}
              {drug.excretion && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Eksekresi</p>
                  <p className="text-sm font-medium">{drug.excretion}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mechanism */}
      {drug.mechanism && (
        <Card>
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Mekanisme Kerja
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <p className="text-sm text-muted-foreground">{drug.mechanism}</p>
          </CardContent>
        </Card>
      )}

      {/* Storage */}
      {drug.storage && (
        <Card>
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Penyimpanan
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <p className="text-sm text-muted-foreground">{drug.storage}</p>
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
                  <p className="font-medium text-sm mb-2 text-primary">{dose.indication}</p>
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
                      {(dose.pediatricMinAge || dose.pediatricMaxAge) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Usia: {dose.pediatricMinAge || '0'} - {dose.pediatricMaxAge || '18'} tahun
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                  {dose.maxDose && (
                    <div className="p-2 rounded bg-orange-50 dark:bg-orange-950/30">
                      <p className="text-[10px] text-orange-600 dark:text-orange-400">Dosis Maks</p>
                      <p className="text-sm font-medium">{dose.maxDose} {dose.maxDoseUnit}</p>
                    </div>
                  )}
                  {dose.frequency && (
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-[10px] text-muted-foreground">Frekuensi</p>
                      <p className="text-sm font-medium">{dose.frequency}</p>
                    </div>
                  )}
                  {dose.duration && (
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-[10px] text-muted-foreground">Durasi</p>
                      <p className="text-sm font-medium">{dose.duration}</p>
                    </div>
                  )}
                </div>
                {(dose.renalAdjust || dose.hepaticAdjust) && (
                  <div className="mt-3 space-y-2">
                    {dose.renalAdjust && (
                      <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/30 text-xs">
                        <span className="font-medium text-amber-700 dark:text-amber-400">Penyesuaian Ginjal:</span>{' '}
                        <span className="text-amber-600 dark:text-amber-300">{dose.renalAdjust}</span>
                      </div>
                    )}
                    {dose.hepaticAdjust && (
                      <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/30 text-xs">
                        <span className="font-medium text-amber-700 dark:text-amber-400">Penyesuaian Hati:</span>{' '}
                        <span className="text-amber-600 dark:text-amber-300">{dose.hepaticAdjust}</span>
                      </div>
                    )}
                  </div>
                )}
                {dose.notes && (
                  <p className="text-xs text-muted-foreground mt-2 italic">{dose.notes}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Indications */}
      {drug.indications.length > 0 && (
        <Card>
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Indikasi
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-2">
              {drug.indications.map((ind) => (
                <div key={ind.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{ind.indication}</p>
                      {ind.isFdaApproved && (
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700">
                          FDA Approved
                        </Badge>
                      )}
                    </div>
                    {ind.icdCode && (
                      <p className="text-xs text-muted-foreground mt-1">ICD-10: {ind.icdCode}</p>
                    )}
                    {ind.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{ind.notes}</p>
                    )}
                  </div>
                  {ind.priority > 0 && (
                    <Badge variant="outline" className="text-xs shrink-0 ml-2">
                      Prioritas: {ind.priority}
                    </Badge>
                  )}
                </div>
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
                    contra.severity === 'absolut' || contra.severity === 'absolute'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  )}>
                    {contra.severity || 'Relatif'}
                  </span>
                  <div className="flex-1">
                    <span>{contra.contraindication}</span>
                    {contra.notes && (
                      <p className="text-xs text-muted-foreground mt-0.5">{contra.notes}</p>
                    )}
                  </div>
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
              Interaksi Obat ({drug.interactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3">
              {drug.interactions.map((interaction) => (
                <div 
                  key={interaction.id} 
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex flex-col gap-1">
                    <Badge 
                      className={cn(
                        'capitalize shrink-0 text-[10px] sm:text-xs',
                        warnaInteraksi[interaction.interactionType?.toLowerCase() || 'minor']
                      )}
                    >
                      {interaction.interactionType || 'Minor'}
                    </Badge>
                    {interaction.evidenceLevel && (
                      <Badge variant="outline" className="text-[10px]">
                        {interaction.evidenceLevel}
                      </Badge>
                    )}
                  </div>
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monitoring Parameters */}
      {drug.monitoringParameters && (
        <Card className="border-violet-200 dark:border-violet-900">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-violet-600 dark:text-violet-400">
              <Activity className="h-4 w-4" />
              Parameter Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{drug.monitoringParameters}</p>
          </CardContent>
        </Card>
      )}

      {/* Counseling Points */}
      {drug.counselingPoints && (
        <Card className="border-teal-200 dark:border-teal-900">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-teal-600 dark:text-teal-400">
              <MessageSquare className="h-4 w-4" />
              Edukasi Pasien
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{drug.counselingPoints}</p>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {drug.notes && (
        <Card>
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Catatan Klinis
            </CardTitle>
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