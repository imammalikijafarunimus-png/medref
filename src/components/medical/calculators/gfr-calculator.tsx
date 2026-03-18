'use client';

import { useState, useMemo } from 'react';
import { Droplets } from 'lucide-react';
import { 
  CalculatorWrapper, 
  InputWithUnit, 
  ResultDisplay,
  ResetButton,
  Disclaimer,
  EmptyResult,
  InfoBox,
  Badge
} from './calculator-ui';
import { calculateGFR, GFRResult } from './calculations';
import { Gender } from './types';

export function GFRCalculator() {
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [serumCr, setSerumCr] = useState<string>('');

  const result = useMemo<GFRResult | null>(() => {
    const a = parseFloat(age);
    const w = parseFloat(weight);
    const cr = parseFloat(serumCr);
    if (!a || !w || !cr || a <= 0 || w <= 0 || cr <= 0) return null;
    return calculateGFR(a, w, cr, gender);
  }, [gender, age, weight, serumCr]);

  const handleReset = () => {
    setGender('male');
    setAge('');
    setWeight('');
    setSerumCr('');
  };

  const hasInputs = age || weight || serumCr;

  const variantMap: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'default'> = {
    success: 'success',
    info: 'info',
    warning: 'warning',
    danger: 'danger',
  };

  const colorMap: Record<string, string> = {
    success: '#059669',
    info: '#0284c7',
    warning: '#d97706',
    danger: '#dc2626',
  };

  return (
    <CalculatorWrapper
      title="Kalkulator GFR"
      description="Cockcroft-Gault untuk fungsi ginjal"
      icon={<Droplets className="h-5 w-5" />}
      iconColor="#0284c7"
      iconBg="#e0f2fe"
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <InputWithUnit
            label="Usia"
            unit="tahun"
            value={age}
            onChange={setAge}
            placeholder="45"
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
            label="Kreatinin"
            unit="mg/dL"
            value={serumCr}
            onChange={setSerumCr}
            placeholder="1.0"
            step="0.01"
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
              label="Laju Filtrasi Glomerulus"
              value={result.gfr}
              unit="mL/min"
              variant={variantMap[result.color] || 'default'}
              showCopy
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <Badge 
                variant="outline" 
                style={{ 
                  fontSize: 14, 
                  padding: '6px 12px', 
                  color: colorMap[result.color],
                  borderColor: colorMap[result.color]
                }}
              >
                Stage {result.stage}
              </Badge>
              <span style={{ fontSize: 14, fontWeight: 500, color: colorMap[result.color] }}>
                {result.description}
              </span>
            </div>

            <InfoBox title="Stadium CKD">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 12 }}>
                <span><strong>G1:</strong> ≥90 (Normal)</span>
                <span><strong>G2:</strong> 60-89 (Ringan)</span>
                <span><strong>G3a:</strong> 45-59 (Sedang)</span>
                <span><strong>G3b:</strong> 30-44 (Sedang-Berat)</span>
                <span><strong>G4:</strong> 15-29 (Berat)</span>
                <span><strong>G5:</strong> &lt;15 (Gagal)</span>
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