'use client';

import Link from 'next/link';
import {
  Pill,
  Calculator,
  AlertTriangle,
  Leaf,
  FileText,
  Heart,
  ChevronRight,
  Beaker,
  Stethoscope,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRef, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface QuickAccessCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: 'blue' | 'orange' | 'red' | 'green' | 'purple' | 'teal' | 'cyan' | 'rose';
  count?: number;
}

// ─── Icon Map ─────────────────────────────────────────────────────────────────

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  pill: Pill,
  calculator: Calculator,
  alert: AlertTriangle,
  leaf: Leaf,
  file: FileText,
  stethoscope: Stethoscope,
  heart: Heart,
  beaker: Beaker,
  activity: Activity,
};

// ─── Component ────────────────────────────────────────────────────────────────

export function QuickAccessCard({
  title,
  description,
  href,
  icon,
  color,
  count,
}: QuickAccessCardProps) {
  const Icon = iconMap[icon] ?? Pill;
  const cardRef = useRef<HTMLAnchorElement>(null);

  // Track mouse position for glow effect
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    };

    card.addEventListener('mousemove', handleMouseMove);
    return () => card.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const colorClass = `quick-card-${color}`;

  const countText =
    count !== undefined
      ? count >= 1000
        ? `${(count / 1000).toFixed(1)}K+`
        : count.toLocaleString('id-ID')
      : null;

  return (
    <Link
      ref={cardRef}
      href={href}
      className={cn(
        'quick-card group',
        colorClass,
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-background'
      )}
    >
      {/* Icon */}
      <div className="quick-card-icon">
        <Icon className="h-[22px] w-[22px]" aria-hidden />
      </div>

      {/* Content */}
      <h3 className="quick-card-title">{title}</h3>
      <p className="quick-card-desc">{description}</p>

      {/* Footer */}
      <div className="quick-card-footer">
        <span className="quick-card-count">
          {countText ? `${countText} item` : 'Buka'}
        </span>
        <ChevronRight
          className="quick-card-arrow h-3.5 w-3.5"
          aria-hidden
        />
      </div>
    </Link>
  );
}