'use client';

import { ReactNode, forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { RefreshCw, Copy, Check, AlertTriangle, Info, Calculator } from 'lucide-react';
import { toast } from 'sonner';

/* ─────────────────────────────────────────────
   CSS STYLES
   ───────────────────────────────────────────── */

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');

.cu-root *,
.cu-root *::before,
.cu-root *::after {
  font-family: 'DM Sans', system-ui, sans-serif;
  box-sizing: border-box;
}

/* ── Card ── */
.cu-card {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06);
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}
.dark .cu-card {
  background: #1e293b;
  border-color: #334155;
}
.cu-card:hover {
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.08);
}

/* ── Card header ── */
.cu-card-header {
  padding: 16px 20px 0;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.cu-card-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  flex-shrink: 0;
  margin-top: 1px;
}
.cu-card-title {
  font-size: 15px;
  font-weight: 650;
  letter-spacing: -0.02em;
  color: #0f172a;
  line-height: 1.3;
}
.dark .cu-card-title {
  color: #f1f5f9;
}
.cu-card-desc {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
  line-height: 1.4;
}

/* ── Card body ── */
.cu-card-body {
  padding: 16px 20px 20px;
}

/* ── Input group ── */
.cu-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.cu-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: #374151;
}
.dark .cu-label {
  color: #cbd5e1;
}
.cu-label-hint {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 400;
  margin-left: 4px;
}

/* ── Input + unit combo ── */
.cu-input-wrap {
  display: flex;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;
  background: #ffffff;
}
.dark .cu-input-wrap {
  border-color: #475569;
  background: #1e293b;
}
.cu-input-wrap:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgb(37 99 235 / 0.1);
}
.cu-input {
  flex: 1;
  min-width: 0;
  height: 44px;
  padding: 0 14px;
  font-size: 15px;
  font-weight: 500;
  color: #0f172a;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'DM Mono', monospace;
}
.dark .cu-input {
  color: #f1f5f9;
}
.cu-input::placeholder {
  color: #cbd5e1;
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
  font-size: 14px;
}
.cu-input:disabled {
  color: #94a3b8;
  cursor: not-allowed;
}
.cu-unit {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
  background: #f8fafc;
  border-left: 1.5px solid #e2e8f0;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.02em;
  white-space: nowrap;
  min-width: 52px;
}
.dark .cu-unit {
  background: #334155;
  border-left-color: #475569;
  color: #94a3b8;
}
.cu-hint {
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.4;
}

/* ── Result display ── */
.cu-result {
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  position: relative;
}
.cu-result-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 6px;
}
.cu-result-value {
  font-family: 'DM Mono', monospace;
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -0.02em;
}
.cu-result-unit {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  margin-left: 6px;
  opacity: 0.7;
}
.cu-result-sub {
  font-size: 12px;
  margin-top: 6px;
  color: #64748b;
}

/* Result variants */
.cu-result-default  { background: #f8fafc; }
.cu-result-success  { background: #f0fdf4; border: 1.5px solid #bbf7d0; }
.cu-result-warning  { background: #fffbeb; border: 1.5px solid #fde68a; }
.cu-result-danger   { background: #fff1f2; border: 1.5px solid #fecdd3; }
.cu-result-info     { background: #eff6ff; border: 1.5px solid #bfdbfe; }

.dark .cu-result-default  { background: #1e293b; }
.dark .cu-result-success  { background: rgba(34, 197, 94, 0.1); border-color: rgba(34, 197, 94, 0.3); }
.dark .cu-result-warning  { background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.3); }
.dark .cu-result-danger   { background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); }
.dark .cu-result-info     { background: rgba(59, 130, 246, 0.1); border-color: rgba(59, 130, 246, 0.3); }

.cu-result-value-default    { color: #0f172a; }
.cu-result-value-success    { color: #15803d; }
.cu-result-value-warning    { color: #b45309; }
.cu-result-value-danger     { color: #be123c; }
.cu-result-value-info       { color: #1d4ed8; }

.dark .cu-result-value-default    { color: #f1f5f9; }
.dark .cu-result-value-success    { color: #4ade80; }
.dark .cu-result-value-warning    { color: #fbbf24; }
.dark .cu-result-value-danger     { color: #f87171; }
.dark .cu-result-value-info       { color: #60a5fa; }

/* Value sizes */
.cu-val-sm { font-size: 22px; }
.cu-val-md { font-size: 28px; }
.cu-val-lg { font-size: 36px; }

/* ── Copy button ── */
.cu-copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #94a3b8;
  transition: background 0.15s, color 0.15s;
}
.cu-copy-btn:hover {
  background: rgb(0 0 0 / 0.06);
  color: #475569;
}

/* ── Result grid ── */
.cu-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.cu-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }

/* ── Reset button ── */
.cu-reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  background: #ffffff;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
  font-family: 'DM Sans', sans-serif;
}
.dark .cu-reset-btn {
  border-color: #475569;
  background: #1e293b;
  color: #94a3b8;
}
.cu-reset-btn:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
  color: #374151;
}
.dark .cu-reset-btn:hover {
  border-color: #64748b;
  background: #334155;
  color: #e2e8f0;
}
.cu-reset-btn:active {
  transform: scale(0.97);
}

/* ── Warning alert ── */
.cu-warning {
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  background: #fffbeb;
  border: 1.5px solid #fde68a;
  align-items: flex-start;
}
.dark .cu-warning {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
}
.cu-warning-icon {
  color: #d97706;
  flex-shrink: 0;
  margin-top: 1px;
}
.cu-warning-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 13px;
  color: #92400e;
  line-height: 1.6;
}
.dark .cu-warning-list {
  color: #fcd34d;
}
.cu-warning-list li::before {
  content: '·  ';
  font-weight: 700;
}

/* ── Formula ── */
.cu-formula {
  padding: 12px 16px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1.5px solid #f1f5f9;
}
.dark .cu-formula {
  background: #1e293b;
  border-color: #334155;
}
.cu-formula-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 4px;
}
.cu-formula-text {
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  color: #334155;
  line-height: 1.5;
}
.dark .cu-formula-text {
  color: #cbd5e1;
}

/* ── Disclaimer ── */
.cu-disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.5;
  font-style: italic;
}

/* ── Empty state ── */
.cu-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
}
.cu-empty-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  color: #94a3b8;
}
.dark .cu-empty-icon {
  background: #334155;
}
.cu-empty-text {
  font-size: 13px;
  color: #94a3b8;
}

/* ── Info box ── */
.cu-info-box {
  padding: 12px 16px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1.5px solid #f1f5f9;
}
.dark .cu-info-box {
  background: #1e293b;
  border-color: #334155;
}
.cu-info-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 8px;
}
.cu-info-content {
  font-size: 13px;
  color: #475569;
  line-height: 1.6;
}
.dark .cu-info-content {
  color: #cbd5e1;
}

/* ── Badge ── */
.cu-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.cu-badge-outline {
  background: transparent;
  border: 1.5px solid currentColor;
}
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === 'undefined') return;
  const tag = document.createElement('style');
  tag.textContent = STYLES;
  document.head.appendChild(tag);
  stylesInjected = true;
}

/* ─────────────────────────────────────────────
   CALCULATOR WRAPPER
   ───────────────────────────────────────────── */

interface CalculatorWrapperProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  iconColor?: string;
  iconBg?: string;
  children: ReactNode;
  className?: string;
}

export function CalculatorWrapper({
  title,
  description,
  icon,
  iconColor = '#2563eb',
  iconBg = '#eff6ff',
  children,
  className,
}: CalculatorWrapperProps) {
  injectStyles();
  return (
    <div className={cn('cu-root cu-card', className)}>
      {icon && (
        <div className="cu-card-header">
          <div className="cu-card-icon" style={{ background: iconBg, color: iconColor }}>
            {icon}
          </div>
          <div style={{ paddingTop: 4 }}>
            <div className="cu-card-title">{title}</div>
            {description && <div className="cu-card-desc">{description}</div>}
          </div>
        </div>
      )}
      {!icon && (
        <div style={{ padding: '16px 20px 0' }}>
          <div className="cu-card-title">{title}</div>
          {description && <div className="cu-card-desc">{description}</div>}
        </div>
      )}
      <div className="cu-card-body">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   INPUT WITH UNIT
   ───────────────────────────────────────────── */

interface InputWithUnitProps {
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'number' | 'text';
  step?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
  hint?: string;
  labelHint?: string;
}

export const InputWithUnit = forwardRef<HTMLInputElement, InputWithUnitProps>(
  ({
    label,
    unit,
    value,
    onChange,
    placeholder,
    type = 'number',
    step,
    min,
    max,
    disabled,
    className,
    hint,
    labelHint,
  }, ref) => {
    injectStyles();
    return (
      <div className={cn('cu-field cu-root', className)}>
        <label className="cu-label">
          {label}
          {labelHint && <span className="cu-label-hint">{labelHint}</span>}
        </label>
        <div className="cu-input-wrap">
          <input
            ref={ref}
            className="cu-input"
            type={type}
            step={step}
            min={min}
            max={max}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
          <div className="cu-unit">{unit}</div>
        </div>
        {hint && <span className="cu-hint">{hint}</span>}
      </div>
    );
  }
);
InputWithUnit.displayName = 'InputWithUnit';

/* ─────────────────────────────────────────────
   RESULT DISPLAY
   ───────────────────────────────────────────── */

interface ResultDisplayProps {
  label: string;
  value: string | number;
  unit?: string;
  subValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showCopy?: boolean;
}

export function ResultDisplay({
  label,
  value,
  unit,
  subValue,
  variant = 'default',
  size = 'lg',
  className,
  showCopy = false,
}: ResultDisplayProps) {
  injectStyles();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = unit ? `${value} ${unit}` : String(value);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Hasil disalin');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('cu-root cu-result', `cu-result-${variant}`, className)}>
      {showCopy && (
        <button className="cu-copy-btn" onClick={handleCopy} title="Salin hasil">
          {copied
            ? <Check style={{ width: 14, height: 14, color: '#16a34a' }} />
            : <Copy style={{ width: 14, height: 14 }} />
          }
        </button>
      )}
      <div className="cu-result-label">{label}</div>
      <div className={cn('cu-result-value', `cu-result-value-${variant}`, `cu-val-${size}`)}>
        {value}
        {unit && <span className="cu-result-unit">{unit}</span>}
      </div>
      {subValue && <div className="cu-result-sub">{subValue}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   RESULT GRID
   ───────────────────────────────────────────── */

interface ResultGridProps {
  children: ReactNode;
  columns?: 2 | 3;
  className?: string;
}

export function ResultGrid({ children, columns = 2, className }: ResultGridProps) {
  injectStyles();
  return (
    <div className={cn('cu-root', columns === 2 ? 'cu-grid-2' : 'cu-grid-3', className)}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   RESET BUTTON
   ───────────────────────────────────────────── */

interface ResetButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export function ResetButton({ onClick, label = 'Reset', className }: ResetButtonProps) {
  injectStyles();
  return (
    <button className={cn('cu-root cu-reset-btn', className)} onClick={onClick}>
      <RefreshCw style={{ width: 13, height: 13 }} />
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────
   WARNING ALERT
   ───────────────────────────────────────────── */

interface WarningAlertProps {
  warnings: string[];
  className?: string;
}

export function WarningAlert({ warnings, className }: WarningAlertProps) {
  injectStyles();
  if (warnings.length === 0) return null;
  return (
    <div className={cn('cu-root cu-warning', className)}>
      <AlertTriangle className="cu-warning-icon" style={{ width: 16, height: 16 }} />
      <ul className="cu-warning-list">
        {warnings.map((w, i) => <li key={i}>{w}</li>)}
      </ul>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FORMULA DISPLAY
   ───────────────────────────────────────────── */

interface FormulaDisplayProps {
  formula: string;
  label?: string;
  className?: string;
}

export function FormulaDisplay({ formula, label = 'Formula', className }: FormulaDisplayProps) {
  injectStyles();
  return (
    <div className={cn('cu-root cu-formula', className)}>
      <div className="cu-formula-label">{label}</div>
      <div className="cu-formula-text">{formula}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DISCLAIMER
   ───────────────────────────────────────────── */

interface DisclaimerProps {
  text?: string;
  className?: string;
}

export function Disclaimer({
  text = 'Hasil perhitungan ini hanya untuk referensi. Selalu verifikasi dengan panduan resmi.',
  className,
}: DisclaimerProps) {
  injectStyles();
  return (
    <div className={cn('cu-root cu-disclaimer', className)}>
      <Info style={{ width: 12, height: 12, flexShrink: 0, marginTop: 1 }} />
      <span>{text}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   EMPTY RESULT STATE
   ───────────────────────────────────────────── */

interface EmptyResultProps {
  message?: string;
  className?: string;
}

export function EmptyResult({
  message = 'Masukkan data untuk melihat hasil',
  className,
}: EmptyResultProps) {
  injectStyles();
  return (
    <div className={cn('cu-root cu-empty', className)}>
      <div className="cu-empty-icon">
        <Calculator style={{ width: 18, height: 18 }} />
      </div>
      <p className="cu-empty-text">{message}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   INFO BOX
   ───────────────────────────────────────────── */

interface InfoBoxProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function InfoBox({ title, children, className }: InfoBoxProps) {
  injectStyles();
  return (
    <div className={cn('cu-root cu-info-box', className)}>
      {title && <div className="cu-info-title">{title}</div>}
      <div className="cu-info-content">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   BADGE
   ───────────────────────────────────────────── */

interface BadgeProps {
  children: ReactNode;
  variant?: 'outline' | 'solid';
  className?: string;
  style?: React.CSSProperties;
}

export function Badge({ children, variant = 'outline', className, style }: BadgeProps) {
  injectStyles();
  return (
    <span 
      className={cn('cu-root cu-badge', variant === 'outline' && 'cu-badge-outline', className)} 
      style={style}
    >
      {children}
    </span>
  );
}