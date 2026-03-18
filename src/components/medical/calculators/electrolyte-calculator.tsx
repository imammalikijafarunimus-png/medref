'use client';

import { useState, useMemo } from 'react';
import { Timer } from 'lucide-react';
import { 
  CalculatorWrapper, 
  InputWithUnit, 
  ResultDisplay,
  ResetButton,
  Disclaimer,
  EmptyResult
} from './calculator-ui';
import { calculateCorrectedSodium, calculateAnionGap, CorrectedSodiumResult, AnionGapResult } from './calculations';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CalcMode = 'sodium' | 'gap';

export function ElectrolyteCalculator() {
  const [activeCalc, setActiveCalc] = useState<CalcMode>('sodium');
  
  // Sodium correction inputs
  const [measuredNa, setMeasuredNa] = useState<string>('');
  const [glucose, setGlucose] = useState<string>('');
  
  // Anion gap inputs
  const [na, setNa] = useState<string>('');
  const [cl, setCl] = useState<string>('');
  const [hco3, setHco3] = useState<string>('');

  // Sodium result
  const sodiumResult = useMemo<CorrectedSodiumResult | null>(() => {
    const na = parseFloat(measuredNa);
    const glu = parseFloat(glucose);
    if (!na || !glu || na <= 0 || glu <= 0) return null;
    return calculateCorrectedSodium(na, glu);
  }, [measuredNa, glucose]);

  // Anion gap result
  const gapResult = useMemo<AnionGapResult | null>(() => {
    const naVal = parseFloat(na);
    const clVal = parseFloat(cl);
    const hco3Val = parseFloat(hco3);
    if (!naVal || !clVal || !hco3Val) return null;
    return calculateAnionGap(naVal, clVal, hco3Val);
  }, [na, cl, hco3]);

  const handleReset = () => {
    if (activeCalc === 'sodium') {
      setMeasuredNa('');
      setGlucose('');
    } else {
      setNa('');
      setCl('');
      setHco3('');
    }
  };

  const hasInputs = activeCalc === 'sodium' 
    ? measuredNa || glucose 
    : na || cl || hco3;

  return (
    <CalculatorWrapper
      title="Kalkulator Elektrolit"
      description="Sodium koreksi & Anion Gap"
      icon={<Timer className="h-5 w-5" />}
      iconColor="text-cyan-600"
    >
      <div className="space-y-4">
        {/* Mode Selector */}
        <div className="flex gap-2">
          <Button
            variant={activeCalc === 'sodium' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCalc('sodium')}
            className="flex-1"
          >
            Na Koreksi
          </Button>
          <Button
            variant={activeCalc === 'gap' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCalc('gap')}
            className="flex-1"
          >
            Anion Gap
          </Button>
        </div>

        {/* Sodium Correction */}
        {activeCalc === 'sodium' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <InputWithUnit
                label="Sodium Terukur"
                unit="mEq/L"
                value={measuredNa}
                onChange={setMeasuredNa}
                placeholder="130"
              />
              <InputWithUnit
                label="Glukosa"
                unit="mg/dL"
                value={glucose}
                onChange={setGlucose}
                placeholder="300"
              />
            </div>

            {hasInputs && (
              <div className="flex justify-end">
                <ResetButton onClick={handleReset} />
              </div>
            )}

            {sodiumResult ? (
              <div className="space-y-4">
                <ResultDisplay
                  label="Sodium Terkoreksi"
                  value={sodiumResult.correctedForGlucose}
                  unit="mEq/L"
                  variant={sodiumResult.correctedForGlucose >= 135 && sodiumResult.correctedForGlucose <= 145 ? 'success' : 'warning'}
                  subValue={sodiumResult.interpretation}
                  showCopy
                />

                <div className="p-3 rounded-lg bg-muted/50 text-xs">
                  <p className="font-medium mb-1">Rumus Katz:</p>
                  <p>Na koreksi = Na terukur + 1.6 × (Glukosa - 100) / 100</p>
                  <p className="mt-2 text-muted-foreground">
                    Sodium menurun 1.6 mEq/L untuk setiap 100 mg/dL glukosa di atas normal.
                  </p>
                </div>

                <Disclaimer />
              </div>
            ) : (
              <EmptyResult />
            )}
          </>
        )}

        {/* Anion Gap */}
        {activeCalc === 'gap' && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <InputWithUnit
                label="Na"
                unit="mEq/L"
                value={na}
                onChange={setNa}
                placeholder="140"
              />
              <InputWithUnit
                label="Cl"
                unit="mEq/L"
                value={cl}
                onChange={setCl}
                placeholder="100"
              />
              <InputWithUnit
                label="HCO₃"
                unit="mEq/L"
                value={hco3}
                onChange={setHco3}
                placeholder="24"
              />
            </div>

            {hasInputs && (
              <div className="flex justify-end">
                <ResetButton onClick={handleReset} />
              </div>
            )}

            {gapResult ? (
              <div className="space-y-4">
                <ResultDisplay
                  label="Anion Gap"
                  value={gapResult.anionGap}
                  unit="mEq/L"
                  variant={gapResult.anionGap >= 8 && gapResult.anionGap <= 12 ? 'success' : 'warning'}
                  subValue={gapResult.anionGap > 12 ? 'Tinggi' : gapResult.anionGap < 8 ? 'Rendah' : 'Normal'}
                  showCopy
                />

                <div className="p-3 rounded-lg bg-muted/50 text-sm">
                  <p className="font-medium mb-1">Interpretasi:</p>
                  <p className="text-muted-foreground">{gapResult.interpretation}</p>
                </div>

                <div className="p-3 rounded-lg bg-muted/50 text-xs">
                  <p className="font-medium mb-1">Rumus:</p>
                  <p>Anion Gap = Na - (Cl + HCO₃)</p>
                  <p className="mt-2 text-muted-foreground">
                    Normal: 8-12 mEq/L
                  </p>
                </div>

                <Disclaimer />
              </div>
            ) : (
              <EmptyResult />
            )}
          </>
        )}
      </div>
    </CalculatorWrapper>
  );
}