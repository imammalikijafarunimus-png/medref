'use client';

import { useState, useMemo } from 'react';
import { Percent } from 'lucide-react';
import { 
  CalculatorWrapper, 
  InputWithUnit, 
  ResultDisplay,
  ResetButton,
  Disclaimer,
  EmptyResult,
  InfoBox
} from './calculator-ui';
import { calculateBSA, BSAResult } from './calculations';

export function BSACalculator() {
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');

  const result = useMemo<BSAResult | null>(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h || w <= 0 || h <= 0) return null;
    return calculateBSA(w, h);
  }, [weight, height]);

  const handleReset = () => {
    setWeight('');
    setHeight('');
  };

  const hasInputs = weight || height;

  return (
    <CalculatorWrapper
      title="Body Surface Area (BSA)"
      description="Mosteller, Du Bois, Haycock"
      icon={<Percent className="h-5 w-5" />}
      iconColor="#0ea5e9"
      iconBg="#f0f9ff"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <InputWithUnit
            label="Berat Badan"
            unit="kg"
            value={weight}
            onChange={setWeight}
            placeholder="70"
            step="0.1"
          />
          <InputWithUnit
            label="Tinggi Badan"
            unit="cm"
            value={height}
            onChange={setHeight}
            placeholder="170"
            step="0.1"
          />
        </div>

        {hasInputs && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ResetButton onClick={handleReset} />
          </div>
        )}

        {result ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ResultDisplay
              label="BSA (Mosteller)"
              value={result.mosteller}
              unit="m²"
              variant="default"
              showCopy
            />

            <InfoBox title="Perbandingan Formula">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500 }}>Mosteller:</span>
                  <span>{result.mosteller} m²</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500 }}>Du Bois:</span>
                  <span>{result.dubois} m²</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500 }}>Haycock:</span>
                  <span>{result.haycock} m²</span>
                </div>
              </div>
            </InfoBox>

            <InfoBox title="Penggunaan Klinis">
              <div style={{ fontSize: 12, color: '#64748b' }}>
                BSA digunakan untuk menghitung dosis kemoterapi, dosis kardiotoksik, dan indeks jantung (Cardiac Index = CO / BSA).
              </div>
            </InfoBox>

            <Disclaimer />
          </div>
        ) : (
          <EmptyResult />
        )}
      </div>
    </CalculatorWrapper>
  );
}