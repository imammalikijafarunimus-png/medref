'use client';

import { useState, useMemo } from 'react';
import { User } from 'lucide-react';
import { 
  CalculatorWrapper, 
  InputWithUnit, 
  ResultDisplay,
  ResetButton,
  Disclaimer,
  EmptyResult,
  InfoBox
} from './calculator-ui';
import { calculateIdealWeight, IdealWeightResult } from './calculations';
import { Gender } from './types';

export function IdealWeightCalculator() {
  const [gender, setGender] = useState<Gender>('male');
  const [height, setHeight] = useState<string>('');

  const result = useMemo<IdealWeightResult | null>(() => {
    const h = parseFloat(height);
    if (!h || h <= 0) return null;
    return calculateIdealWeight(h, gender);
  }, [gender, height]);

  const handleReset = () => {
    setGender('male');
    setHeight('');
  };

  const hasInputs = height;

  return (
    <CalculatorWrapper
      title="Berat Badan Ideal"
      description="Formula Devine, Robinson, Miller"
      icon={<User className="h-5 w-5" />}
      iconColor="#8b5cf6"
      iconBg="#f5f3ff"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label className="cu-label cu-root">Jenis Kelamin</label>
          <select
            className="cu-root"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1.5px solid #e2e8f0',
              background: '#ffffff',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 500,
              color: '#0f172a',
              cursor: 'pointer',
            }}
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
          >
            <option value="male">Laki-laki</option>
            <option value="female">Perempuan</option>
          </select>
        </div>

        <InputWithUnit
          label="Tinggi Badan"
          unit="cm"
          value={height}
          onChange={setHeight}
          placeholder="170"
          step="0.1"
        />

        {hasInputs && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ResetButton onClick={handleReset} />
          </div>
        )}

        {result ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ResultDisplay
              label="Berat Badan Ideal (Devine)"
              value={result.devine}
              unit="kg"
              variant="success"
              showCopy
            />

            <InfoBox title="Perbandingan Formula">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500 }}>Devine:</span>
                  <span>{result.devine} kg</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500 }}>Robinson:</span>
                  <span>{result.robinson} kg</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500 }}>Miller:</span>
                  <span>{result.miller} kg</span>
                </div>
              </div>
            </InfoBox>

            <InfoBox title="Rentang BMI Normal (18.5 - 25)">
              <div style={{ fontSize: 13, textAlign: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 16, color: '#059669' }}>
                  {result.bmiRange.min} - {result.bmiRange.max} kg
                </span>
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