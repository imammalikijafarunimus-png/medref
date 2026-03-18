'use client';

import { useState, useMemo } from 'react';
import { Activity } from 'lucide-react';
import { 
  CalculatorWrapper, 
  InputWithUnit, 
  ResultDisplay,
  ResetButton,
  Disclaimer,
  EmptyResult,
  InfoBox,
  WarningAlert
} from './calculator-ui';
import { calculateWarfarinDose } from './calculations';
import { WarfarinRecommendation } from './types';

export function WarfarinCalculator() {
  const [currentInr, setCurrentInr] = useState<string>('');
  const [targetInrMin, setTargetInrMin] = useState<string>('2.0');
  const [targetInrMax, setTargetInrMax] = useState<string>('3.0');

  const result = useMemo<WarfarinRecommendation | null>(() => {
    const inr = parseFloat(currentInr);
    const min = parseFloat(targetInrMin);
    const max = parseFloat(targetInrMax);
    if (!inr || inr <= 0) return null;
    return calculateWarfarinDose(inr, min || 2.0, max || 3.0);
  }, [currentInr, targetInrMin, targetInrMax]);

  const handleReset = () => {
    setCurrentInr('');
    setTargetInrMin('2.0');
    setTargetInrMax('3.0');
  };

  const hasInputs = currentInr;

  const isHighRisk = result && parseFloat(currentInr) > 5;

  return (
    <CalculatorWrapper
      title="Warfarin Dosing"
      description="Rekomendasi penyesuaian dosis"
      icon={<Activity className="h-5 w-5" />}
      iconColor="#dc2626"
      iconBg="#fef2f2"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <InputWithUnit
          label="INR Saat Ini"
          unit=""
          value={currentInr}
          onChange={setCurrentInr}
          placeholder="2.5"
          step="0.1"
        />

        <InfoBox title="Target INR">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <InputWithUnit
              label="Target Min"
              unit=""
              value={targetInrMin}
              onChange={setTargetInrMin}
              placeholder="2.0"
              step="0.1"
            />
            <InputWithUnit
              label="Target Max"
              unit=""
              value={targetInrMax}
              onChange={setTargetInrMax}
              placeholder="3.0"
              step="0.1"
            />
          </div>
        </InfoBox>

        {hasInputs && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ResetButton onClick={handleReset} />
          </div>
        )}

        {result ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {isHighRisk && (
              <WarningAlert warnings={['INR tinggi - Evaluasi risiko perdarahan segera!']} />
            )}

            <ResultDisplay
              label="Tindakan"
              value=""
              unit=""
              subValue={result.action}
              variant={parseFloat(currentInr) > 4 ? 'danger' : parseFloat(currentInr) < 2 ? 'warning' : 'success'}
              showCopy
            />

            <InfoBox title="Detail Rekomendasi">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500 }}>INR berikutnya:</span>
                  <span>{result.nextInr}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontWeight: 500 }}>Catatan:</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{result.notes}</span>
                </div>
              </div>
            </InfoBox>

            <InfoBox title="Indikasi Target INR">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 12 }}>
                <span><strong>2.0-3.0:</strong> Fibrilasi atrium, VTE</span>
                <span><strong>2.5-3.5:</strong> Katup mekanik, VTE rekuren</span>
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