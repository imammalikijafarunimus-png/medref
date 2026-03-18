'use client';

import { useState, useMemo } from 'react';
import { Zap } from 'lucide-react';
import { 
  CalculatorWrapper, 
  InputWithUnit, 
  ResultDisplay,
  ResetButton,
  Disclaimer,
  EmptyResult,
  InfoBox
} from './calculator-ui';
import { calculateMAC, macValues, MACResult } from './calculations';

export function AnesthesiaCalculator() {
  const [agent, setAgent] = useState<string>('sevoflurane');
  const [age, setAge] = useState<string>('');
  const [temp, setTemp] = useState<string>('37');
  const [nitrousOxide, setNitrousOxide] = useState<string>('0');

  const result = useMemo<MACResult | null>(() => {
    const a = parseFloat(age);
    const t = parseFloat(temp);
    const n2o = parseFloat(nitrousOxide);
    if (!a || a <= 0) return null;
    return calculateMAC(agent, a, t || 37, n2o || 0);
  }, [agent, age, temp, nitrousOxide]);

  const handleReset = () => {
    setAgent('sevoflurane');
    setAge('');
    setTemp('37');
    setNitrousOxide('0');
  };

  const hasInputs = age;

  const agentLabels: Record<string, string> = {
    'sevoflurane': 'Sevoflurane',
    'isoflurane': 'Isoflurane',
    'desflurane': 'Desflurane',
    'halothane': 'Halothane',
    'enflurane': 'Enflurane',
  };

  return (
    <CalculatorWrapper
      title="MAC Calculator"
      description="Minimum Alveolar Concentration"
      icon={<Zap className="h-5 w-5" />}
      iconColor="#7c3aed"
      iconBg="#f5f3ff"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label className="cu-label cu-root">Agen Anestesi Volatil</label>
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
            value={agent}
            onChange={(e) => setAgent(e.target.value)}
          >
            {Object.entries(agentLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <InputWithUnit
            label="Usia"
            unit="tahun"
            value={age}
            onChange={setAge}
            placeholder="40"
          />
          <InputWithUnit
            label="Suhu"
            unit="°C"
            value={temp}
            onChange={setTemp}
            placeholder="37"
            step="0.1"
          />
          <InputWithUnit
            label="N₂O"
            unit="%"
            value={nitrousOxide}
            onChange={setNitrousOxide}
            placeholder="0"
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
              label="Konsentrasi Rekomendasi"
              value={result.recommendedConcentration.replace('%', '')}
              unit="%"
              variant="success"
              showCopy
            />

            <InfoBox title="Penyesuaian MAC">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500 }}>MAC Baseline:</span>
                  <span>{result.mac}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500 }}>MAC (usia):</span>
                  <span>{result.ageAdjustedMac}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500 }}>MAC (dengan N₂O):</span>
                  <span>{result.macWithN2O}%</span>
                </div>
              </div>
            </InfoBox>

            <InfoBox title="Nilai MAC Standar">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 12 }}>
                {Object.entries(macValues).filter(([k]) => k !== 'nitrous_oxide').map(([key, value]) => (
                  <span key={key}><strong>{agentLabels[key] || key}:</strong> {value}%</span>
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