'use client';

import { useState, useEffect } from 'react';
import { Calculator, Baby, AlertTriangle } from 'lucide-react';
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
          // Filter yang punya dosis pediatrik
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
      
      // Parse dosis pediatrik (asumsi format: "10-15 mg/kg/hari")
      const pediatricDose = selectedDrug.pediatricDose || '';
      
      // Ekstrak angka dari string dosis
      const doseMatch = pediatricDose.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
      const singleDoseMatch = pediatricDose.match(/(\d+(?:\.\d+)?)/);
      
      let dosePerKg = 0;
      let unit = 'mg';
      
      if (doseMatch) {
        // Ambil rata-rata dari range
        const min = parseFloat(doseMatch[1]);
        const max = parseFloat(doseMatch[2]);
        dosePerKg = (min + max) / 2;
      } else if (singleDoseMatch) {
        dosePerKg = parseFloat(singleDoseMatch[1]);
      }

      // Extract unit
      const unitMatch = pediatricDose.match(/(mg|mcg|g|unit|IU)/i);
      if (unitMatch) {
        unit = unitMatch[1].toLowerCase();
      }

      const calculatedDose = dosePerKg * weightNum;
      
      // Parse max dose
      let maxDoseNum = null;
      if (selectedDrug.maxDose) {
        const maxMatch = selectedDrug.maxDose.match(/(\d+(?:\.\d+)?)/);
        if (maxMatch) {
          maxDoseNum = parseFloat(maxMatch[1]);
        }
      }

      const isWithinMax = maxDoseNum ? calculatedDose <= maxDoseNum : true;

      // Warning berdasarkan usia
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
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/30">
          <Calculator className="h-6 w-6 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Kalkulator Dosis Pediatrik</h1>
          <p className="text-muted-foreground">
            Hitung dosis obat berdasarkan berat badan anak
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Input Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pilih Obat */}
          <div className="space-y-2">
            <Label htmlFor="drug">Pilih Obat</Label>
            <select
              id="drug"
              className="w-full px-3 py-2 border rounded-md bg-background"
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
            <Label htmlFor="weight">Berat Badan (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              min="0"
              max="200"
              placeholder="Contoh: 15"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          {/* Usia (opsional) */}
          <div className="space-y-2">
            <Label htmlFor="age">Usia (tahun) - Opsional</Label>
            <Input
              id="age"
              type="number"
              step="0.1"
              min="0"
              max="18"
              placeholder="Contoh: 5"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleCalculate} 
            disabled={!selectedDrug || !weight || loading}
            className="w-full"
          >
            {loading ? 'Menghitung...' : 'Hitung Dosis'}
          </Button>
        </CardContent>
      </Card>

      {/* Info Obat Terpilih */}
      {selectedDrug && selectedDrug.pediatricDose && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Dosis Pediatrik Referensi:</p>
            <p className="font-medium mt-1">{selectedDrug.pediatricDose}</p>
          </CardContent>
        </Card>
      )}

      {/* Hasil */}
      {result && (
        <Card className={cn(
          result.isWithinMax ? 'border-green-200 dark:border-green-900' : 'border-red-200 dark:border-red-900'
        )}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {result.isWithinMax ? (
                <Baby className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              Hasil Perhitungan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Dosis Hitung</p>
                <p className="text-2xl font-bold">
                  {result.calculatedDose} {result.unit}
                </p>
              </div>
              {result.maxDose && (
                <div>
                  <p className="text-sm text-muted-foreground">Dosis Maksimum</p>
                  <p className="text-2xl font-bold">
                    {result.maxDose} {result.unit}
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <p className="text-muted-foreground">Formula:</p>
              <p className="font-mono mt-1">{result.formula}</p>
            </div>

            {!result.isWithinMax && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Dosis melebihi batas maksimum! Konsultasikan dengan dokter.
                </AlertDescription>
              </Alert>
            )}

            {result.warning && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{result.warning}</AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertDescription className="text-xs">
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