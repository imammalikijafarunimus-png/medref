'use client';

import { useState } from 'react';
import { 
  Beaker, Search, ChevronDown, ChevronUp, 
  AlertTriangle, Info, Heart, Droplets, Activity,
  Flame, Zap, Sun
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

// =============================================
// LAB VALUES DATA
// =============================================
interface LabValue {
  name: string;
  category: string;
  unit: string;
  maleMin?: number;
  maleMax?: number;
  femaleMin?: number;
  femaleMax?: number;
  min?: number;
  max?: number;
  criticalLow?: number;
  criticalHigh?: number;
  notes?: string;
}

const labValues: LabValue[] = [
  // HEMATOLOGI
  { name: 'Hemoglobin (Hb)', category: 'Hematologi', unit: 'g/dL', maleMin: 13.5, maleMax: 17.5, femaleMin: 12.0, femaleMax: 15.5, criticalLow: 7, criticalHigh: 20, notes: 'Anemia jika < normal' },
  { name: 'Hematokrit (Ht)', category: 'Hematologi', unit: '%', maleMin: 40, maleMax: 50, femaleMin: 36, femaleMax: 44, criticalLow: 20, criticalHigh: 60 },
  { name: 'Eritrosit (RBC)', category: 'Hematologi', unit: 'juta/µL', maleMin: 4.5, maleMax: 5.9, femaleMin: 4.0, femaleMax: 5.2 },
  { name: 'Leukosit (WBC)', category: 'Hematologi', unit: '/µL', min: 4000, max: 11000, criticalLow: 2500, criticalHigh: 30000, notes: 'Leukopenia <4000, Leukositosis >11000' },
  { name: 'Trombosit', category: 'Hematologi', unit: '/µL', min: 150000, max: 400000, criticalLow: 50000, criticalHigh: 1000000, notes: 'Trombositopenia <150.000' },
  { name: 'MCV', category: 'Hematologi', unit: 'fL', min: 80, max: 100, notes: 'Mikrositer <80, Makrositer >100' },
  { name: 'MCH', category: 'Hematologi', unit: 'pg', min: 27, max: 33 },
  { name: 'MCHC', category: 'Hematologi', unit: 'g/dL', min: 32, max: 36 },
  { name: 'RDW', category: 'Hematologi', unit: '%', min: 11.5, max: 14.5 },
  { name: 'Hitung Jenis Leukosit', category: 'Hematologi', unit: '', notes: 'Neutrofil: 50-70%, Limfosit: 20-40%, Monosit: 2-8%, Eosinofil: 1-4%, Basofil: 0-1%' },
  
  // KIMIA DARAH
  { name: 'Gula Darah Puasa', category: 'Kimia Darah', unit: 'mg/dL', min: 70, max: 100, criticalLow: 50, criticalHigh: 400, notes: 'Prediabetes: 100-125, DM: ≥126' },
  { name: 'Gula Darah 2 Jam PP', category: 'Kimia Darah', unit: 'mg/dL', min: 70, max: 140, notes: 'Prediabetes: 140-199, DM: ≥200' },
  { name: 'HbA1c', category: 'Kimia Darah', unit: '%', min: 4.0, max: 5.6, notes: 'Prediabetes: 5.7-6.4, DM: ≥6.5' },
  { name: 'Ureum', category: 'Kimia Darah', unit: 'mg/dL', min: 15, max: 40, criticalHigh: 100 },
  { name: 'Kreatinin', category: 'Kimia Darah', unit: 'mg/dL', maleMin: 0.7, maleMax: 1.3, femaleMin: 0.6, femaleMax: 1.1, criticalHigh: 4 },
  { name: 'Asam Urat', category: 'Kimia Darah', unit: 'mg/dL', maleMin: 3.5, maleMax: 7.0, femaleMin: 2.5, femaleMax: 6.0, notes: 'Hiperurisemia >7 mg/dL' },
  { name: 'Total Protein', category: 'Kimia Darah', unit: 'g/dL', min: 6.0, max: 8.0 },
  { name: 'Albumin', category: 'Kimia Darah', unit: 'g/dL', min: 3.5, max: 5.0 },
  { name: 'Globulin', category: 'Kimia Darah', unit: 'g/dL', min: 2.0, max: 3.5 },
  { name: 'Bilirubin Total', category: 'Kimia Darah', unit: 'mg/dL', min: 0.2, max: 1.0, criticalHigh: 15 },
  { name: 'Bilirubin Direct', category: 'Kimia Darah', unit: 'mg/dL', min: 0.0, max: 0.3 },
  { name: 'SGOT/AST', category: 'Kimia Darah', unit: 'U/L', min: 10, max: 40, criticalHigh: 1000, notes: 'Tinggi: kerusakan hepatosit' },
  { name: 'SGPT/ALT', category: 'Kimia Darah', unit: 'U/L', min: 10, max: 40, criticalHigh: 1000, notes: 'Lebih spesifik untuk hepar' },
  { name: 'GGT', category: 'Kimia Darah', unit: 'U/L', maleMin: 10, maleMax: 60, femaleMin: 5, femaleMax: 35 },
  { name: 'Alkali Fosfatase', category: 'Kimia Darah', unit: 'U/L', min: 30, max: 120, notes: 'Meningkat pada obstruksi biliar' },
  
  // PROFIL LIPID
  { name: 'Kolesterol Total', category: 'Profil Lipid', unit: 'mg/dL', min: 0, max: 200, notes: 'Borderline: 200-239, Tinggi: ≥240' },
  { name: 'LDL Kolesterol', category: 'Profil Lipid', unit: 'mg/dL', min: 0, max: 100, notes: 'Optimal: <100, Target DM: <70' },
  { name: 'HDL Kolesterol', category: 'Profil Lipid', unit: 'mg/dL', maleMin: 40, maleMax: 999, femaleMin: 50, femaleMax: 999, notes: 'Rendah: <40 (pria), <50 (wanita)' },
  { name: 'Trigliserida', category: 'Profil Lipid', unit: 'mg/dL', min: 0, max: 150, notes: 'Borderline: 150-199, Tinggi: ≥200' },
  
  // ELEKTROLIT
  { name: 'Natrium (Na)', category: 'Elektrolit', unit: 'mEq/L', min: 135, max: 145, criticalLow: 120, criticalHigh: 160, notes: 'Hiponatremia <135' },
  { name: 'Kalium (K)', category: 'Elektrolit', unit: 'mEq/L', min: 3.5, max: 5.0, criticalLow: 2.5, criticalHigh: 6.5, notes: 'Hiperkalemia dapat aritmia' },
  { name: 'Klorida (Cl)', category: 'Elektrolit', unit: 'mEq/L', min: 98, max: 107 },
  { name: 'Kalsium Total', category: 'Elektrolit', unit: 'mg/dL', min: 8.5, max: 10.5, criticalLow: 6, criticalHigh: 14 },
  { name: 'Magnesium (Mg)', category: 'Elektrolit', unit: 'mg/dL', min: 1.7, max: 2.4, criticalLow: 1.0, criticalHigh: 4.0 },
  
  // FUNGSI TIROID
  { name: 'TSH', category: 'Fungsi Tiroid', unit: 'mIU/L', min: 0.4, max: 4.0, notes: 'Hipotiroidisme: >4.0' },
  { name: 'T4 Total', category: 'Fungsi Tiroid', unit: 'µg/dL', min: 5.0, max: 12.0 },
  { name: 'T4 Bebas (Free T4)', category: 'Fungsi Tiroid', unit: 'ng/dL', min: 0.8, max: 1.8 },
  { name: 'T3 Total', category: 'Fungsi Tiroid', unit: 'ng/dL', min: 80, max: 200 },
  
  // KOAGULASI
  { name: 'PT (Protrombin Time)', category: 'Koagulasi', unit: 'detik', min: 11, max: 14, notes: 'INR target warfarin: 2.0-3.0' },
  { name: 'APTT', category: 'Koagulasi', unit: 'detik', min: 25, max: 35, notes: 'Monitor heparin' },
  { name: 'INR', category: 'Koagulasi', unit: '', min: 0.9, max: 1.1, notes: 'Terapi warfarin: 2.0-3.0' },
  { name: 'D-Dimer', category: 'Koagulasi', unit: 'ng/mL', min: 0, max: 500, notes: 'Tinggi pada VTE, DIC' },
  
  // MARKER JANTUNG
  { name: 'Troponin I', category: 'Marker Jantung', unit: 'ng/mL', min: 0, max: 0.04, criticalHigh: 0.5, notes: 'Tinggi pada MI akut' },
  { name: 'CK-MB', category: 'Marker Jantung', unit: 'U/L', min: 0, max: 25 },
  { name: 'BNP', category: 'Marker Jantung', unit: 'pg/mL', min: 0, max: 100, notes: '>400: gagal jantung sangat mungkin' },
  
  // MARKER INFEKSI
  { name: 'CRP', category: 'Marker Infeksi', unit: 'mg/L', min: 0, max: 10, notes: 'Radang/infeksi jika >10' },
  { name: 'Procalcitonin', category: 'Marker Infeksi', unit: 'ng/mL', min: 0, max: 0.5, criticalHigh: 2, notes: '>2: sepsis sangat mungkin' },
  { name: 'ESR (LED)', category: 'Marker Infeksi', unit: 'mm/jam', maleMin: 0, maleMax: 15, femaleMin: 0, femaleMax: 20 },
  
  // GAS DARAH
  { name: 'pH', category: 'Gas Darah', unit: '', min: 7.35, max: 7.45, criticalLow: 7.2, criticalHigh: 7.6 },
  { name: 'pO2', category: 'Gas Darah', unit: 'mmHg', min: 75, max: 100, criticalLow: 60, notes: 'Hipoksemia: <80' },
  { name: 'pCO2', category: 'Gas Darah', unit: 'mmHg', min: 35, max: 45, criticalLow: 25, criticalHigh: 60 },
  { name: 'HCO3', category: 'Gas Darah', unit: 'mEq/L', min: 22, max: 26 },
  { name: 'SaO2', category: 'Gas Darah', unit: '%', min: 95, max: 100, criticalLow: 90 },
  { name: 'Laktat', category: 'Gas Darah', unit: 'mmol/L', min: 0.5, max: 2.0, criticalHigh: 4, notes: '>4: kritis' },
  
  // FUNGSI GINJAL
  { name: 'eGFR', category: 'Fungsi Ginjal', unit: 'mL/min/1.73m²', min: 90, max: 999, notes: 'CKD Stage 3-5 jika <60' },
  { name: 'BUN', category: 'Fungsi Ginjal', unit: 'mg/dL', min: 7, max: 20 },
  
  // URINALISIS
  { name: 'Berat Jenis Urine', category: 'Urinalisis', unit: '', min: 1.005, max: 1.030 },
  { name: 'pH Urine', category: 'Urinalisis', unit: '', min: 4.5, max: 8.0 },
  { name: 'Protein Urine', category: 'Urinalisis', unit: 'mg/24jam', min: 0, max: 150 },
  
  // VITAMIN & MINERAL
  { name: 'Vitamin D (25-OH)', category: 'Vitamin', unit: 'ng/mL', min: 30, max: 100, notes: 'Defisiensi: <20' },
  { name: 'Vitamin B12', category: 'Vitamin', unit: 'pg/mL', min: 200, max: 900 },
  { name: 'Ferritin', category: 'Vitamin', unit: 'ng/mL', maleMin: 30, maleMax: 300, femaleMin: 15, femaleMax: 150 },
  { name: 'Zat Besi', category: 'Vitamin', unit: 'µg/dL', maleMin: 60, maleMax: 170, femaleMin: 50, femaleMax: 150 },
];

// =============================================
// CATEGORY CONFIG
// =============================================
const categoryConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  'Hematologi': { icon: Droplets, color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950/30' },
  'Kimia Darah': { icon: Beaker, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
  'Profil Lipid': { icon: Heart, color: 'text-pink-600', bgColor: 'bg-pink-50 dark:bg-pink-950/30' },
  'Elektrolit': { icon: Zap, color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-950/30' },
  'Fungsi Tiroid': { icon: Activity, color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950/30' },
  'Koagulasi': { icon: Droplets, color: 'text-rose-600', bgColor: 'bg-rose-50 dark:bg-rose-950/30' },
  'Marker Jantung': { icon: Heart, color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950/30' },
  'Marker Infeksi': { icon: Flame, color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950/30' },
  'Gas Darah': { icon: Activity, color: 'text-cyan-600', bgColor: 'bg-cyan-50 dark:bg-cyan-950/30' },
  'Fungsi Ginjal': { icon: Droplets, color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/30' },
  'Urinalisis': { icon: Droplets, color: 'text-teal-600', bgColor: 'bg-teal-50 dark:bg-teal-950/30' },
  'Vitamin': { icon: Sun, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950/30' },
};

// =============================================
// MAIN COMPONENT
// =============================================
export default function LabValuesPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categories = ['all', ...Array.from(new Set(labValues.map(v => v.category)))];

  const filteredValues = labValues.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
                          v.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || v.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedValues = filteredValues.reduce((acc, v) => {
    if (!acc[v.category]) acc[v.category] = [];
    acc[v.category].push(v);
    return acc;
  }, {} as Record<string, LabValue[]>);

  const formatValue = (v: LabValue): string => {
    if (v.min !== undefined && v.max !== undefined) {
      return `${v.min} - ${v.max}`;
    }
    if (v.maleMin !== undefined && v.maleMax !== undefined && v.femaleMin !== undefined && v.femaleMax !== undefined) {
      if (v.maleMin === v.femaleMin && v.maleMax === v.femaleMax) {
        return `${v.maleMin} - ${v.maleMax}`;
      }
      return `♂ ${v.maleMin}-${v.maleMax} / ♀ ${v.femaleMin}-${v.femaleMax}`;
    }
    return '-';
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 sm:p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 shrink-0">
          <Beaker className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Nilai Normal Laboratorium</h1>
          <p className="text-sm text-muted-foreground">Referensi nilai normal pemeriksaan lab</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari pemeriksaan laboratorium..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Badge
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'secondary'}
            className="cursor-pointer hover:bg-primary/10"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === 'all' ? 'Semua' : cat}
          </Badge>
        ))}
      </div>

      {/* Results */}
      <p className="text-sm text-muted-foreground">{filteredValues.length} pemeriksaan ditemukan</p>

      {/* Lab Values by Category */}
      <div className="space-y-4">
        {Object.entries(groupedValues).map(([category, values]) => {
          const config = categoryConfig[category] || { icon: Beaker, color: 'text-gray-600', bgColor: 'bg-gray-50' };
          const Icon = config.icon;
          const isExpanded = expandedCategory === category || selectedCategory !== 'all';

          return (
            <Card key={category} className="overflow-hidden">
              <CardHeader 
                className={cn('pb-3 cursor-pointer', config.bgColor)}
                onClick={() => setExpandedCategory(isExpanded ? null : category)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={cn('h-5 w-5', config.color)} />
                    <div>
                      <CardTitle className="text-base">{category}</CardTitle>
                      <CardDescription>{values.length} pemeriksaan</CardDescription>
                    </div>
                  </div>
                  {selectedCategory === 'all' && (
                    isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="p-0">
                  <div className="divide-y">
                    {values.map((v, idx) => (
                      <div key={idx} className={cn('p-3 sm:p-4 border-l-4', v.criticalLow || v.criticalHigh ? 'border-l-rose-500' : 'border-l-primary')}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium text-sm">{v.name}</h3>
                              {v.criticalLow && v.criticalHigh && (
                                <Badge variant="outline" className="text-xs border-rose-500 text-rose-600">Critical</Badge>
                              )}
                            </div>
                            {v.notes && <p className="text-xs text-muted-foreground mt-0.5">{v.notes}</p>}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-mono text-sm font-medium">{formatValue(v)}</p>
                            <p className="text-xs text-muted-foreground">{v.unit}</p>
                          </div>
                        </div>

                        {(v.criticalLow || v.criticalHigh) && (
                          <div className="flex gap-3 mt-2 text-xs flex-wrap">
                            {v.criticalLow && (
                              <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/30 text-rose-700">
                                Kritis &lt;{v.criticalLow}
                              </span>
                            )}
                            {v.criticalHigh && (
                              <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/30 text-rose-700">
                                Kritis &gt;{v.criticalHigh}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Disclaimer */}
      <Alert className="text-xs">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Disclaimer:</strong> Nilai referensi dapat berbeda antar laboratorium. 
          Selalu gunakan nilai referensi dari laboratorium tempat pemeriksaan dilakukan.
        </AlertDescription>
      </Alert>
    </div>
  );
}