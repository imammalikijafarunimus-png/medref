'use client';

import { memo } from 'react';
import { Pill, Leaf, FileText, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { FavoriteItemType } from './types';

interface FavoritesEmptyStateProps {
  type: FavoriteItemType;
}

const config = {
  drug: {
    icon: Pill,
    label: 'obat',
    href: '/drugs',
    bgColor: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  herbal: {
    icon: Leaf,
    label: 'herbal',
    href: '/herbals',
    bgColor: 'bg-green-500/10',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  note: {
    icon: FileText,
    label: 'catatan',
    href: '/notes',
    bgColor: 'bg-amber-500/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
};

export const FavoritesEmptyState = memo(function FavoritesEmptyState({
  type,
}: FavoritesEmptyStateProps) {
  const { icon: Icon, label, href, bgColor, iconColor } = config[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Icon */}
      <div className="relative mb-6">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${bgColor}`}>
          <Icon className={`w-10 h-10 ${iconColor}`} />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <Star className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-card-foreground mb-2">
        Belum ada {label} favorit
      </h3>

      {/* Description */}
      <p className="text-muted-foreground max-w-sm mb-6">
        Tap ikon <Star className="inline w-4 h-4 mx-1 text-yellow-500" /> pada halaman detail untuk menyimpan {label} favorit Anda
      </p>

      {/* CTA Button */}
      <Link href={href}>
        <Button className="gap-2">
          <span>Jelajahi {label.charAt(0).toUpperCase() + label.slice(1)}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );
});