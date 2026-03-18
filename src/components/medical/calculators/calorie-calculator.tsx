'use client';

import { useState, useMemo } from 'react';
import { Flame } from 'lucide-react';
import { 
  CalculatorWrapper, 
  InputWithUnit, 
  ResultDisplay, 
  ResultGrid,
  ResetButton,
  Disclaimer,
  EmptyResult
} from './calculator-ui';
import { calculateCalories, CalorieResult } from './calculations';
import { Gender, ActivityLevel } from './types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export function CalorieCalculator() {
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');

  const activityLabels: Record<ActivityLevel, string> = {
    sedentary: 'Jarang bergerak',
    light: 'Ringan (1-3x/minggu)',
    moderate: 'Sedang (3-5x/minggu)',
    active: 'Aktif (6-7x/minggu)',
    very_active: 'Sangat aktif',
  };

  // Instant calculation when inputs change
  const result = useMemo<CalorieResult | null>(() => {
    const a = parseFloat(age);
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!a || !w || !h || a <= 0 || w <= 0 || h <= 0) return null;
    return calculateCalories(a, w, h, gender, activityLevel);
  }, [gender, age, weight, height, activityLevel]);

  const handleReset = () => {
    setGender('male');
    setAge('');
    setWeight('');
    setHeight('');
    setActivityLevel('moderate');
  };

  const hasInputs = age || weight || height;

  return (
    <CalculatorWrapper
      title="Kalkulator Kalori"
      description="BMR & TDEE (Mifflin-St Jeor)"
      icon={<Flame className="h-5 w-5" />}
      iconColor="text-orange-600"
    >
      <div className="space-y-4">
        {/* Gender Select */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Jenis Kelamin</Label>
          <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Laki-laki</SelectItem>
              <SelectItem value="female">Perempuan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-3 gap-3">
          <InputWithUnit
            label="Usia"
            unit="tahun"
            value={age}
            onChange={setAge}
            placeholder="30"
          />
          <InputWithUnit
            label="Berat Badan"
            unit="kg"
            value={weight}
            onChange={setWeight}
            placeholder="70"
            step="0.1"
          />
          <InputWithUnit
            label="Tinggi"
            unit="cm"
            value={height}
            onChange={setHeight}
            placeholder="170"
          />
        </div>

        {/* Activity Level Select */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Tingkat Aktivitas</Label>
          <Select value={activityLevel} onValueChange={(v) => setActivityLevel(v as ActivityLevel)}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(activityLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reset Button */}
        {hasInputs && (
          <div className="flex justify-end">
            <ResetButton onClick={handleReset} />
          </div>
        )}

        {/* Results */}
        {result ? (
          <div className="space-y-4">
            <ResultGrid columns={2}>
              <ResultDisplay
                label="BMR (Basal)"
                value={result.bmr}
                unit="kkal/hari"
                variant="info"
                size="md"
                showCopy
              />
              <ResultDisplay
                label="TDEE (Total)"
                value={result.tdee}
                unit="kkal/hari"
                variant="warning"
                size="md"
                showCopy
              />
            </ResultGrid>

            {/* Macro Recommendations */}
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-3">Rekomendasi Makronutrien:</p>
              <ResultGrid columns={3}>
                <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-center">
                  <p className="text-xs font-medium text-red-700">Protein</p>
                  <p className="text-sm font-bold text-red-800">{result.protein}</p>
                </div>
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-center">
                  <p className="text-xs font-medium text-amber-700">Karbohidrat</p>
                  <p className="text-sm font-bold text-amber-800">{result.carbs}</p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-center">
                  <p className="text-xs font-medium text-emerald-700">Lemak</p>
                  <p className="text-sm font-bold text-emerald-800">{result.fat}</p>
                </div>
              </ResultGrid>
            </div>

            {/* Tips */}
            <div className="p-3 rounded-lg bg-muted/50 text-xs space-y-1">
              <p className="font-medium">Tips:</p>
              <p>• Defisit 500 kkal/hari = turun ~0.5 kg/minggu</p>
              <p>• Surplus 500 kkal/hari = naik ~0.5 kg/minggu</p>
            </div>

            <Disclaimer />
          </div>
        ) : (
          <EmptyResult />
        )}
      </div>
    </CalculatorWrapper>
  );
}