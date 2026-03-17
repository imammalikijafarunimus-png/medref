// app/components/DynamicYear.tsx
'use client';
import { useEffect, useState } from 'react';

export function DynamicYear() {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => setYear(new Date().getFullYear()), []);
  return <span>{year ?? '...'}</span>;
}