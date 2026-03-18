'use client';

import { useState, useEffect, useMemo } from 'react';
import { Baby, Search } from 'lucide-react';
import { 
  CalculatorWrapper, 
  InputWithUnit, 
  ResultDisplay,
  ResultGrid,
  ResetButton,
  WarningAlert,
  FormulaDisplay,
  Disclaimer,
  EmptyResult
} from './calculator-ui';
import { calculatePediatricDose, PediatricDoseResult } from './calculations';
import { DrugInfo, DrugDose } from './types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function PediatricDoseCalculator() {
  const [drugs, setDrugs] = useState<DrugInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDrug, setSelectedDrug] = useState<DrugInfo | null>(null);
  const [selectedDose, setSelectedDose] = useState<DrugDose | null>(null);
  const [weight, setWeight] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Fetch drugs on mount
  useEffect(() => {
    async function fetchDrugs() {
      try {
        const res = await fetch('/api/drugs?limit=200');
        const data = await res.json();
        if (data.success) {
          const pediatricDrugs = data.data.filter(
            (drug: DrugInfo) => drug.doses?.some((d: DrugDose) => d.pediatricDose)
          );
          setDrugs(pediatricDrugs);
        }
      } catch (error) {
        console.error('Error fetching drugs:', error);
        toast.error('Gagal memuat data obat');
      } finally {
        setLoading(false);
      }
    }
    fetchDrugs();
  }, []);

  // Filter drugs based on search
  const filteredDrugs = useMemo(() => {
    if (!searchQuery) return drugs;
    const query = searchQuery.toLowerCase();
    return drugs.filter(
      (drug) =>
        drug.name.toLowerCase().includes(query) ||
        drug.genericName?.toLowerCase().includes(query)
    );
  }, [drugs, searchQuery]);

  // Calculate result instantly
  const result = useMemo<PediatricDoseResult | null>(() => {
    if (!selectedDose || !weight) return null;
    const w = parseFloat(weight);
    const a = age ? parseFloat(age) : null;
    if (!w || w <= 0) return null;
    return calculatePediatricDose(
      selectedDose.pediatricDose || '',
      w,
      a,
      selectedDose.maxDose,
      selectedDose.frequency,
      selectedDose.pediatricMinAge
    );
  }, [selectedDose, weight, age]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedDrug(null);
    setSelectedDose(null);
    setWeight('');
    setAge('');
  };

  const handleDrugSelect = (drugId: string) => {
    const drug = drugs.find((d) => d.id === drugId);
    setSelectedDrug(drug || null);
    setSelectedDose(null);
  };

  const handleDoseSelect = (doseId: string) => {
    const dose = selectedDrug?.doses.find((d) => d.id === doseId);
    setSelectedDose(dose || null);
  };

  const hasInputs = selectedDrug || weight || age;

  return (
    <CalculatorWrapper
      title="Kalkulator Dosis Pediatrik"
      description="Hitung dosis berdasarkan berat badan"
      icon={<Baby className="h-5 w-5" />}
      iconColor="text-sky-600"
    >
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Memuat data obat...
          </div>
        ) : (
          <>
            {/* Drug Search/Select */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Pilih Obat</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ketik nama obat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-11"
                />
              </div>
              <Select value={selectedDrug?.id || ''} onValueChange={handleDrugSelect}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={filteredDrugs.length + ' obat tersedia'} />
                </SelectTrigger>
                <SelectContent>
                  {filteredDrugs.slice(0, 50).map((drug) => (
                    <SelectItem key={drug.id} value={drug.id}>
                      {drug.name} {drug.genericName ? `(${drug.genericName})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Indication Select (when drug selected) */}
            {selectedDrug && selectedDrug.doses.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Indikasi</Label>
                <Select value={selectedDose?.id || ''} onValueChange={handleDoseSelect}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Pilih indikasi..." />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedDrug.doses.filter((d) => d.pediatricDose).map((dose) => (
                      <SelectItem key={dose.id} value={dose.id}>
                        {dose.indication || 'Dosis umum'} - {dose.pediatricDose}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Weight and Age Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <InputWithUnit
                label="Berat Badan"
                unit="kg"
                value={weight}
                onChange={setWeight}
                placeholder="10"
                step="0.1"
                hint="Wajib"
              />
              <InputWithUnit
                label="Usia"
                unit="tahun"
                value={age}
                onChange={setAge}
                placeholder="Opsional"
                step="0.1"
                hint="Untuk validasi"
              />
            </div>

            {/* Reset Button */}
            {hasInputs && (
              <div className="flex justify-end">
                <ResetButton onClick={handleReset} />
              </div>
            )}

            {/* Selected Dose Info */}
            {selectedDose && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
                <p className="text-xs text-muted-foreground mb-2">Informasi Dosis:</p>
                <p><strong>Pediatrik:</strong> {selectedDose.pediatricDose}</p>
                {selectedDose.maxDose && (
                  <p><strong>Maks:</strong> {selectedDose.maxDose} {selectedDose.maxDoseUnit}</p>
                )}
                {selectedDose.frequency && (
                  <p><strong>Frekuensi:</strong> {selectedDose.frequency}</p>
                )}
              </div>
            )}

            {/* Results */}
            {result ? (
              <div className="space-y-4">
                <ResultGrid columns={2}>
                  <ResultDisplay
                    label="Dosis"
                    value={result.minDose === result.maxDose 
                      ? result.maxDose 
                      : `${result.minDose}-${result.maxDose}`}
                    unit={result.unit}
                    subValue={result.frequency || ''}
                    variant={result.warnings.length > 0 ? 'warning' : 'success'}
                    size="md"
                    showCopy
                  />
                  {result.maxAllowed && (
                    <ResultDisplay
                      label="Dosis Maks"
                      value={result.maxAllowed}
                      unit="mg/hari"
                      variant="default"
                      size="md"
                    />
                  )}
                </ResultGrid>

                <FormulaDisplay formula={result.formula} />

                {result.warnings.length > 0 && (
                  <WarningAlert warnings={result.warnings} />
                )}

                <Disclaimer text="Hasil perhitungan ini hanya untuk referensi. Selalu verifikasi dengan panduan dosis resmi." />
              </div>
            ) : selectedDose ? (
              <EmptyResult message="Masukkan berat badan untuk menghitung dosis" />
            ) : (
              <EmptyResult message="Pilih obat dan indikasi untuk memulai" />
            )}
          </>
        )}
      </div>
    </CalculatorWrapper>
  );
}