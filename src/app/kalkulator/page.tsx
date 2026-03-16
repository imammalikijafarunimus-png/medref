'use client';

import { useState, useEffect } from 'react';
import { Calculator, Baby, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface DrugDoseInfo {
  id: string;
  name: string;
  genericName: string | null;
  pediatricDose: string | null;
  maxDose: string | null;
  maxDoseUnit: string | null;
}

export default function KalkulatorPage() {
  const [drugs, setDrugs] = useState<DrugDoseInfo[]>([]);
  const [selectedDrug, setSelectedDrug] = useState<DrugDoseInfo | null>(null);
  const [weight, setWeight] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [result, setResult] = useState<{
    calculatedDose: number | null;
    maxDose: number | null;
    unit: string;
    isWithinMax: boolean;
    formula: string;
    warning: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch drugs dengan dosis pediatrik
  useEffect(() => {
    async function fetchDrugs() {
      try {
        const res = await fetch('/api/drugs?limit=100');
        const data = await res.json();
        if (data.success) {
          const pediatricDrugs = data.data.filter(
            (drug: DrugDoseInfo & { doses: { pediatricDose: string | null }[] }) => 
              drug.doses?.some((d: { pediatricDose: string | null }) => d.pediatricDose)
          );
          setDrugs(pediatricDrugs);
        }
      } catch (error) {
        console.error('Error fetching drugs:', error);
      }
    }
    fetchDrugs();
  }, []);

  const handleCalculate = () => {
    if (!selectedDrug || !weight) return;

    setLoading(true);

    try {
      const weightNum = parseFloat(weight);
      const pediatricDose = selectedDrug.pediatricDose || '';
      
      const doseMatch = pediatricDose.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
      const singleDoseMatch = pediatricDose.match(/(\d+(?:\.\d+)?)/);
      
      let dosePerKg = 0;
      let unit = 'mg';
      
      if (doseMatch) {
        const min = parseFloat(doseMatch[1]);
        const max = parseFloat(doseMatch[2]);
        dosePerKg = (min + max) / 2;
      } else if (singleDoseMatch) {
        dosePerKg = parseFloat(singleDoseMatch[1]);
      }

      const unitMatch = pediatricDose.match(/(mg|mcg|g|unit|IU)/i);
      if (unitMatch) {
        unit = unitMatch[1].toLowerCase();
      }

      const calculatedDose = dosePerKg * weightNum;
      
      let maxDoseNum = null;
      if (selectedDrug.maxDose) {
        const maxMatch = selectedDrug.maxDose.match(/(\d+(?:\.\d+)?)/);
        if (maxMatch) {
          maxDoseNum = parseFloat(maxMatch[1]);
        }
      }

      const isWithinMax = maxDoseNum ? calculatedDose <= maxDoseNum : true;

      let warning = null;
      if (age) {
        const ageNum = parseFloat(age);
        if (ageNum < 1) {
          warning = 'Perhatian khusus untuk bayi < 1 tahun. Konsultasikan dengan dokter.';
        } else if (ageNum < 2) {
          warning = 'Dosis anak kecil memerlukan perhatian khusus.';
        }
      }

      setResult({
        calculatedDose: Math.round(calculatedDose * 100) / 100,
        maxDose: maxDoseNum,
        unit,
        isWithinMax,
        formula: `${dosePerKg} ${unit}/kg × ${weightNum} kg`,
        warning,
      });
    } catch (error) {
      console.error('Error calculating dose:', error);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 sm:p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 shrink-0">
          <Calculator className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Kalkulator Dosis Pediatrik</h1>
          <p className="text-sm text-muted-foreground">
            Hitung dosis obat berdasarkan berat badan anak
          </p>
        </div>
      </div>

      {/* Input Card */}
      <Card>
        <CardHeader className="pb-3 px-4 sm:px-6">
          <CardTitle className="text-sm sm:text-base">Input Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          {/* Pilih Obat */}
          <div className="space-y-2">
            <Label htmlFor="drug" className="text-sm">Pilih Obat</Label>
            <select
              id="drug"
              className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={selectedDrug?.id || ''}
              onChange={(e) => {
                const drug = drugs.find((d) => d.id === e.target.value);
                setSelectedDrug(drug || null);
                setResult(null);
              }}
            >
              <option value="">-- Pilih Obat --</option>
              {drugs.map((drug) => (
                <option key={drug.id} value={drug.id}>
                  {drug.name} {drug.genericName ? `(${drug.genericName})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Berat Badan */}
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-sm">Berat Badan (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              min="0"
              max="200"
              placeholder="Contoh: 15"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="h-11"
            />
          </div>

          {/* Usia */}
          <div className="space-y-2">
            <Label htmlFor="age" className="text-sm">Usia (tahun) - Opsional</Label>
            <Input
              id="age"
              type="number"
              step="0.1"
              min="0"
              max="18"
              placeholder="Contoh: 5"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="h-11"
            />
          </div>

          <Button 
            onClick={handleCalculate} 
            disabled={!selectedDrug || !weight || loading}
            className="w-full h-11"
          >
            {loading ? 'Menghitung...' : 'Hitung Dosis'}
          </Button>
        </CardContent>
      </Card>

      {/* Info Obat Terpilih */}
      {selectedDrug && selectedDrug.pediatricDose && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Dosis Pediatrik Referensi:</p>
                <p className="font-medium mt-1 text-sm">{selectedDrug.pediatricDose}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hasil */}
      {result && (
        <Card className={cn(
          result.isWithinMax 
            ? 'border-emerald-200 dark:border-emerald-900' 
            : 'border-rose-200 dark:border-rose-900'
        )}>
          <CardHeader className="pb-3 px-4 sm:px-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              {result.isWithinMax ? (
                <Baby className="h-5 w-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-rose-600" />
              )}
              Hasil Perhitungan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Dosis Hitung</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {result.calculatedDose} {result.unit}
                </p>
              </div>
              {result.maxDose && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Dosis Maksimum</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {result.maxDose} {result.unit}
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Formula:</p>
              <p className="font-mono mt-1 text-sm">{result.formula}</p>
            </div>

            {!result.isWithinMax && (
              <Alert variant="destructive" className="text-sm">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Dosis melebihi batas maksimum! Konsultasikan dengan dokter.
                </AlertDescription>
              </Alert>
            )}

            {result.warning && (
              <Alert className="text-sm">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{result.warning}</AlertDescription>
              </Alert>
            )}

            <Alert className="text-xs">
              <AlertDescription>
                <strong>Disclaimer:</strong> Hasil perhitungan ini hanya untuk referensi. 
                Selalu verifikasi dengan dosis resmi dan konsultasikan dengan dokter atau apoteker.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}