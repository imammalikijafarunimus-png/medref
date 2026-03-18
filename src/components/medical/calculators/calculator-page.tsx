'use client';

import { useState } from 'react';
import {
  Calculator, Pill, Syringe, Zap, Beaker, Activity,
  Scale, Droplets, Flame, User, Percent, Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import calculator components
import { BMICalculator } from './bmi-calculator';
import { InfusionCalculator } from './infusion-calculator';
import { GFRCalculator } from './gfr-calculator';
import { CalorieCalculator } from './calorie-calculator';
import { IdealWeightCalculator } from './ideal-weight-calculator';
import { BSACalculator } from './bsa-calculator';
import { AnesthesiaCalculator } from './anesthesia-calculator';
import { SteroidCalculator } from './steroid-calculator';
import { WarfarinCalculator } from './warfarin-calculator';
import { ElectrolyteCalculator } from './electrolyte-calculator';
import { PediatricDoseCalculator } from './pediatric-dose-calculator';

/* ─────────────────────────────────────────────
   CSS STYLES
   ───────────────────────────────────────────── */

const PAGE_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');

.calc-page-root * {
  font-family: 'DM Sans', system-ui, sans-serif;
  box-sizing: border-box;
}

/* ── Variables ── */
.calc-page-root {
  --cat-dosing: #2563eb;
  --cat-dosing-bg: #eff6ff;
  --cat-renal: #0891b2;
  --cat-renal-bg: #ecfeff;
  --cat-nutrition: #d97706;
  --cat-nutrition-bg: #fffbeb;
  --cat-anesthesia: #7c3aed;
  --cat-anesthesia-bg: #f5f3ff;
  --cat-electrolyte: #0891b2;
  --cat-electrolyte-bg: #ecfeff;
}

.dark .calc-page-root {
  --cat-dosing-bg: rgba(37, 99, 235, 0.15);
  --cat-renal-bg: rgba(8, 145, 178, 0.15);
  --cat-nutrition-bg: rgba(217, 119, 6, 0.15);
  --cat-anesthesia-bg: rgba(124, 58, 237, 0.15);
  --cat-electrolyte-bg: rgba(8, 145, 178, 0.15);
}

/* ── Pill nav buttons ── */
.calc-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1.5px solid var(--border, #e2e8f0);
  background: var(--surface, #ffffff);
  color: var(--text-2, #64748b);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  line-height: 1.4;
}
.calc-pill:hover {
  border-color: var(--border-2, #cbd5e1);
  background: var(--surface-2, #f8fafc);
  color: var(--text-1, #0f172a);
}
.calc-pill.active {
  border-color: var(--pill-accent);
  background: var(--pill-bg);
  color: var(--pill-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--pill-accent) 12%, transparent);
}
.calc-pill .pill-icon {
  opacity: 0.7;
  transition: opacity 0.15s;
}
.calc-pill.active .pill-icon {
  opacity: 1;
}

/* ── Category section header ── */
.cat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.cat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.cat-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-3, #94a3b8);
}
.cat-line {
  flex: 1;
  height: 1px;
  background: var(--border, #e2e8f0);
}

/* ── Scrollable pill row ── */
.pills-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* ── Active calculator header bar ── */
.active-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 14px;
  background: var(--active-bg);
  border: 1.5px solid color-mix(in srgb, var(--active-accent) 20%, transparent);
  margin-bottom: 20px;
  animation: slideDown 0.2s ease;
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
.active-icon-wrap {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: color-mix(in srgb, var(--active-accent) 15%, transparent);
  color: var(--active-accent);
  flex-shrink: 0;
}
.active-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-1, #0f172a);
  letter-spacing: -0.02em;
}
.dark .active-name {
  color: #f1f5f9;
}
.active-desc {
  font-size: 12px;
  color: var(--text-2, #64748b);
  margin-top: 1px;
}

/* ── Main header ── */
.main-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
}
.header-icon-wrap {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
  box-shadow: 0 4px 12px rgb(37 99 235 / 0.3);
  flex-shrink: 0;
}
.header-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text-1, #0f172a);
  line-height: 1.2;
}
.dark .header-title {
  color: #f1f5f9;
}
.header-sub {
  font-size: 13px;
  color: var(--text-2, #64748b);
  margin-top: 2px;
  letter-spacing: -0.01em;
}

/* ── Nav container ── */
.nav-container {
  background: var(--surface, #ffffff);
  border: 1.5px solid var(--border, #e2e8f0);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.06);
}
.dark .nav-container {
  background: #1e293b;
  border-color: #334155;
}

/* ── Content panel ── */
.content-panel {
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Mobile select ── */
.mobile-select-wrap {
  margin-bottom: 16px;
}
.mobile-select-wrap label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-3, #94a3b8);
  margin-bottom: 6px;
}
.mobile-select {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1.5px solid var(--border, #e2e8f0);
  background: var(--surface, #ffffff);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-1, #0f172a);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  cursor: pointer;
}
.dark .mobile-select {
  background-color: #1e293b;
  border-color: #475569;
  color: #f1f5f9;
}
.mobile-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgb(37 99 235 / 0.12);
}

@media (min-width: 640px) {
  .mobile-only { display: none !important; }
}
@media (max-width: 639px) {
  .desktop-only { display: none !important; }
}
`;

let pageStylesInjected = false;
function injectPageStyles() {
  if (pageStylesInjected || typeof document === 'undefined') return;
  const tag = document.createElement('style');
  tag.textContent = PAGE_STYLES;
  document.head.appendChild(tag);
  pageStylesInjected = true;
}

/* ─────────────────────────────────────────────
   CALCULATOR CONFIG
   ───────────────────────────────────────────── */

interface CalculatorConfig {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: 'dosing' | 'renal' | 'nutrition' | 'anesthesia' | 'electrolyte';
  icon: React.ReactNode;
  component: React.ReactNode;
}

const calculators: CalculatorConfig[] = [
  {
    id: 'pediatric',
    name: 'Dosis Pediatrik',
    shortName: 'Dosis Anak',
    description: 'Hitung dosis berdasarkan berat badan anak',
    category: 'dosing',
    icon: <Pill className="h-4 w-4" />,
    component: <PediatricDoseCalculator />,
  },
  {
    id: 'infusion',
    name: 'Kalkulator Infus',
    shortName: 'Infus',
    description: 'Kecepatan dan tetesan per menit',
    category: 'dosing',
    icon: <Syringe className="h-4 w-4" />,
    component: <InfusionCalculator />,
  },
  {
    id: 'anesthesia',
    name: 'Kalkulator MAC',
    shortName: 'Anestesi',
    description: 'Minimum Alveolar Concentration',
    category: 'anesthesia',
    icon: <Zap className="h-4 w-4" />,
    component: <AnesthesiaCalculator />,
  },
  {
    id: 'steroid',
    name: 'Konversi Steroid',
    shortName: 'Steroid',
    description: 'Konversi dosis antar jenis steroid',
    category: 'dosing',
    icon: <Beaker className="h-4 w-4" />,
    component: <SteroidCalculator />,
  },
  {
    id: 'warfarin',
    name: 'Panduan Warfarin',
    shortName: 'Warfarin',
    description: 'Penyesuaian dosis berdasarkan INR',
    category: 'dosing',
    icon: <Activity className="h-4 w-4" />,
    component: <WarfarinCalculator />,
  },
  {
    id: 'bmi',
    name: 'Kalkulator BMI',
    shortName: 'BMI',
    description: 'Indeks Massa Tubuh',
    category: 'nutrition',
    icon: <Scale className="h-4 w-4" />,
    component: <BMICalculator />,
  },
  {
    id: 'gfr',
    name: 'Kalkulator GFR',
    shortName: 'GFR',
    description: 'Cockcroft-Gault untuk fungsi ginjal',
    category: 'renal',
    icon: <Droplets className="h-4 w-4" />,
    component: <GFRCalculator />,
  },
  {
    id: 'calorie',
    name: 'Kalkulator Kalori',
    shortName: 'Kalori',
    description: 'BMR & TDEE (Mifflin-St Jeor)',
    category: 'nutrition',
    icon: <Flame className="h-4 w-4" />,
    component: <CalorieCalculator />,
  },
  {
    id: 'ideal',
    name: 'Berat Badan Ideal',
    shortName: 'BB Ideal',
    description: 'Estimasi berdasarkan tinggi badan',
    category: 'nutrition',
    icon: <User className="h-4 w-4" />,
    component: <IdealWeightCalculator />,
  },
  {
    id: 'bsa',
    name: 'Luas Permukaan Tubuh',
    shortName: 'BSA',
    description: 'Body Surface Area untuk dosis kemoterapi',
    category: 'dosing',
    icon: <Percent className="h-4 w-4" />,
    component: <BSACalculator />,
  },
  {
    id: 'electrolyte',
    name: 'Kalkulator Elektrolit',
    shortName: 'Elektrolit',
    description: 'Sodium koreksi & Anion Gap',
    category: 'electrolyte',
    icon: <Timer className="h-4 w-4" />,
    component: <ElectrolyteCalculator />,
  },
];

const categories = [
  { id: 'dosing', label: 'Dosis', accent: 'var(--cat-dosing)', accentBg: 'var(--cat-dosing-bg)' },
  { id: 'renal', label: 'Ginjal', accent: 'var(--cat-renal)', accentBg: 'var(--cat-renal-bg)' },
  { id: 'nutrition', label: 'Nutrisi', accent: 'var(--cat-nutrition)', accentBg: 'var(--cat-nutrition-bg)' },
  { id: 'anesthesia', label: 'Anestesi', accent: 'var(--cat-anesthesia)', accentBg: 'var(--cat-anesthesia-bg)' },
  { id: 'electrolyte', label: 'Elektrolit', accent: 'var(--cat-electrolyte)', accentBg: 'var(--cat-electrolyte-bg)' },
] as const;

const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

/* ─────────────────────────────────────────────
   CALCULATOR PAGE COMPONENT
   ───────────────────────────────────────────── */

export function CalculatorPage() {
  injectPageStyles();
  const [activeTab, setActiveTab] = useState('pediatric');

  const activeCalc = calculators.find((c) => c.id === activeTab)!;
  const activeCat = categoryMap[activeCalc.category];

  return (
    <div className="calc-page-root" style={{ maxWidth: 680, margin: '0 auto', padding: '8px 4px' }}>
      {/* ── Main Header ── */}
      <div className="main-header">
        <div className="header-icon-wrap">
          <Calculator style={{ width: 24, height: 24, color: '#ffffff' }} />
        </div>
        <div>
          <div className="header-title">Kalkulator Medis</div>
          <div className="header-sub">11 kalkulator klinis — dosis, nutrisi, ginjal & lebih</div>
        </div>
      </div>

      {/* ── Mobile Select ── */}
      <div className="mobile-only mobile-select-wrap">
        <label>Pilih Kalkulator</label>
        <select
          className="mobile-select"
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
        >
          {categories.map((cat) => (
            <optgroup key={cat.id} label={cat.label}>
              {calculators
                .filter((c) => c.category === cat.id)
                .map((calc) => (
                  <option key={calc.id} value={calc.id}>
                    {calc.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* ── Desktop Nav ── */}
      <div className="desktop-only nav-container">
        {categories.map((cat) => {
          const calcsInCat = calculators.filter((c) => c.category === cat.id);
          return (
            <div key={cat.id} style={{ marginBottom: 14 }}>
              <div className="cat-header">
                <div className="cat-dot" style={{ background: cat.accent }} />
                <span className="cat-label">{cat.label}</span>
                <div className="cat-line" />
              </div>
              <div className="pills-row">
                {calcsInCat.map((calc) => {
                  const isActive = activeTab === calc.id;
                  return (
                    <button
                      key={calc.id}
                      className={cn('calc-pill', isActive && 'active')}
                      style={
                        {
                          '--pill-accent': cat.accent,
                          '--pill-bg': cat.accentBg,
                        } as React.CSSProperties
                      }
                      onClick={() => setActiveTab(calc.id)}
                    >
                      <span className="pill-icon">{calc.icon}</span>
                      {calc.shortName}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Active Calculator Label ── */}
      <div
        className="active-bar"
        key={activeTab}
        style={
          {
            '--active-accent': activeCat.accent,
            '--active-bg': activeCat.accentBg,
          } as React.CSSProperties
        }
      >
        <div className="active-icon-wrap">{activeCalc.icon}</div>
        <div>
          <div className="active-name">{activeCalc.name}</div>
          <div className="active-desc">{activeCalc.description}</div>
        </div>
      </div>

      {/* ── Calculator Content ── */}
      <div className="content-panel" key={`content-${activeTab}`}>
        {calculators.map((calc) => (
          <div
            key={calc.id}
            style={{ display: activeTab === calc.id ? 'block' : 'none' }}
          >
            {calc.component}
          </div>
        ))}
      </div>
    </div>
  );
}