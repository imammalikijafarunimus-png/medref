'use client';

import { useState, useMemo } from 'react';
import { Syringe } from 'lucide-react';
import { 
  CalculatorWrapper, 
  InputWithUnit, 
  ResultDisplay, 
  ResultGrid,
  ResetButton,
  FormulaDisplay,
  EmptyResult
} from './calculator-ui';
import { calculateInfusion, InfusionResult } from './calculations';

export function InfusionCalculator() {
  const [volume, setVolume] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [dropFactor, setDropFactor] = useState<string>('20');

  // Instant calculation when inputs change
  const result = useMemo<InfusionResult | null>(() => {
    const v = parseFloat(volume);
    const d = parseFloat(duration);
    const df = parseFloat(dropFactor);
    if (!v || !d || v <= 0 || d <= 0) return null;
    return calculateInfusion(v, d, df);
  }, [volume, duration, dropFactor]);

  const handleReset = () => {
    setVolume('');
    setDuration('');
    setDropFactor('20');
  };

  const hasInputs = volume || duration;

  return (
    <CalculatorWrapper
      title="Kalkulator Infus"
      description="Kecepatan dan tetesan per menit"
      icon={<Syringe className="h-5 w-5" />}
      iconColor="#7c3aed"
      iconBg="#ede9fe"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <InputWithUnit
            label="Volume"
            unit="mL"
            value={volume}
            onChange={setVolume}
            placeholder="500"
          />
          <InputWithUnit
            label="Durasi"
            unit="jam"
            value={duration}
            onChange={setDuration}
            placeholder="8"
            step="0.5"
          />
        </div>

        {/* Drop Factor Select */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label className="cu-label cu-root">Drop Factor</label>
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
            value={dropFactor}
            onChange={(e) => setDropFactor(e.target.value)}
          >
            <option value="10">10 tetes/mL (Makroset - dewasa)</option>
            <option value="15">15 tetes/mL (Makroset - standar)</option>
            <option value="20">20 tetes/mL (Makroset - umum)</option>
            <option value="60">60 tetes/mL (Mikroset - pediatrik)</option>
          </select>
        </div>

        {/* Reset Button */}
        {hasInputs && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ResetButton onClick={handleReset} />
          </div>
        )}

        {/* Results */}
        {result ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ResultGrid columns={2}>
              <ResultDisplay
                label="Kecepatan"
                value={result.flowRateMlHr}
                unit="mL/jam"
                variant="info"
                size="md"
                showCopy
              />
              <ResultDisplay
                label="Tetesan"
                value={result.dripRate}
                unit="tetes/menit"
                variant="info"
                size="md"
                showCopy
              />
            </ResultGrid>

            <FormulaDisplay 
              formula={`${volume} mL ÷ ${duration} jam = ${result.flowRateMlHr} mL/jam`}
              label="Perhitungan"
            />

            <div className="cu-root cu-info-box">
              <div className="cu-info-title">Panduan Drop Factor</div>
              <div className="cu-info-content">
                <p>• <strong>Makroset (10-20):</strong> Dewasa, volume besar</p>
                <p>• <strong>Mikroset (60):</strong> Pediatrik, presisi tinggi</p>
              </div>
            </div>
          </div>
        ) : (
          <EmptyResult />
        )}
      </div>
    </CalculatorWrapper>
  );
}