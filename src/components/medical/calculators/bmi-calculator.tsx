'use client';

import { useState, useMemo } from 'react';
import { Scale } from 'lucide-react';
import { 
  CalculatorWrapper, 
  InputWithUnit, 
  ResultDisplay, 
  ResetButton,
  Disclaimer,
  EmptyResult,
  InfoBox
} from './calculator-ui';
import { calculateBMI, BMIResult } from './calculations';

export function BMICalculator() {
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');

  const result = useMemo<BMIResult | null>(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h || w <= 0 || h <= 0) return null;
    return calculateBMI(w, h);
  }, [weight, height]);

  const handleReset = () => {
    setWeight('');
    setHeight('');
  };

  const hasInputs = weight || height;

  const variantMap: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
    success: 'success',
    warning: 'warning',
    danger: 'danger',
  };

  return (
    <CalculatorWrapper
      title="Kalkulator BMI / IMT"
      description="Indeks Massa Tubuh"
      icon={<Scale className="h-5 w-5" />}
      iconColor="#059669"
      iconBg="#d1fae5"
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
              label="BMI Anda"
              value={result.bmi}
              unit="kg/m²"
              subValue={result.category}
              variant={variantMap[result.color] || 'default'}
              showCopy
            />

            <InfoBox title="Kategori BMI">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 12 }}>
                <span>&lt; 18.5: Kurang</span>
                <span style={{ color: '#059669' }}>18.5 - 24.9: Normal</span>
                <span style={{ color: '#d97706' }}>25 - 29.9: Overweight</span>
                <span style={{ color: '#dc2626' }}>≥ 30: Obesitas</span>
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