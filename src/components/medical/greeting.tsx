// /src/components/medical/greeting.tsx
'use client';

import { useMemo } from 'react';

function getGreeting(): { greeting: string; emoji: string; sub: string } {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return {
      greeting: 'Selamat Pagi',
      emoji: '🌤️',
      sub: 'Semoga hari kerja Anda berjalan lancar.',
    };
  } else if (hour >= 12 && hour < 15) {
    return {
      greeting: 'Selamat Siang',
      emoji: '☀️',
      sub: 'Tetap semangat di tengah kesibukan.',
    };
  } else if (hour >= 15 && hour < 18) {
    return {
      greeting: 'Selamat Sore',
      emoji: '🌇',
      sub: 'Sedikit lagi menuju akhir shift.',
    };
  } else {
    return {
      greeting: 'Selamat Malam',
      emoji: '🌙',
      sub: 'Jaga kesehatan Anda juga.',
    };
  }
}

export function Greeting() {
  const { greeting, emoji, sub } = useMemo(() => getGreeting(), []);

  return (
    <div className="text-center space-y-1">
      <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
        <span>{emoji}</span>
        <span>{greeting}</span>
      </p>
      <p className="text-xs text-muted-foreground/60">{sub}</p>
    </div>
  );
}