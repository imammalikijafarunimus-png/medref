'use client';

import { useState, useMemo } from 'react';
import { Pill } from 'lucide-react';
import { 
  CalculatorWrapper, 
  InputWithUnit, 
  ResultDisplay,
  ResetButton,
  Disclaimer,
  EmptyResult,
  InfoBox
} from './calculator-ui';
import { convertSteroid, steroidConversions, SteroidConversionResult } from './calculations';

export function SteroidCalculator() {
  const [fromSteroid, setFromSteroid] = useState<string>('prednisone');
  const [dose, setDose] = useState<string>('');
  const [toSteroid, setToSteroid] = useState<string>('dexamethasone');

  const result = useMemo<SteroidConversionResult | null>(() => {
    const d = parseFloat(dose);
    if (!d || d <= 0) return null;
    return convertSteroid(fromSteroid, d, toSteroid);
  }, [fromSteroid, dose, toSteroid]);

  const handleReset = () => {
    setFromSteroid('prednisone');
    setDose('');
    setToSteroid('dexamethasone');
  };

  const hasInputs = dose;

  return (
    <CalculatorWrapper
      title="Konversi Steroid"
      description="Ekuivalensi dosis steroid"
      icon={<Pill className="h-5 w-5" />}
      iconColor="#f59e0b"
      iconBg="#fffbeb"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="cu-label cu-root">Dari Steroid</label>
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
              value={fromSteroid}
              onChange={(e) => setFromSteroid(e.target.value)}
            >
              {Object.entries(steroidConversions).map(([key, info]) => (
                <option key={key} value={key}>{info.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="cu-label cu-root">Ke Steroid</label>
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
              value={toSteroid}
              onChange={(e) => setToSteroid(e.target.value)}
            >
              {Object.entries(steroidConversions).map(([key, info]) => (
                <option key={key} value={key}>{info.name}</option>
              ))}
            </select>
          </div>
        </div>

        <InputWithUnit
          label="Dosis"
          unit="mg"
          value={dose}
          onChange={setDose}
          placeholder="5"
          step="0.5"
        />

        {hasInputs && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ResetButton onClick={handleReset} />
          </div>
        )}

        {result ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ResultDisplay
              label={`Dosis Ekuivalen ${result.toInfo.name}`}
              value={result.equivalentDose}
              unit="mg"
              variant="success"
              showCopy
            />

            <InfoBox title="Detail Konversi">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500 }}>Dosis awal:</span>
                  <span>{dose} mg {result.fromInfo.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500 }}>Ekuivalen Prednison:</span>
                  <span>{result.prednisoneEquivalent} mg</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500 }}>Durasi kerja:</span>
                  <span>{result.toInfo.duration}</span>
                </div>
              </div>
            </InfoBox>

            <InfoBox title="Tabel Ekuivalensi (ke Prednison 5mg)">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 12 }}>
                {Object.entries(steroidConversions).slice(0, 8).map(([key, info]) => (
                  <span key={key}><strong>{info.name}:</strong> {info.equivalentDose} mg</span>
                ))}
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