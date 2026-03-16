'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pill, ChevronRight, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Drug } from '@prisma/client';

// Extended Drug type with relations
type DrugWithRelations = Drug & {
  indications?: { indication: string }[];
  _count?: {
    interactions: number;
    contraindications: number;
  };
};

interface DrugCardProps {
  drug: DrugWithRelations;
  showInteractions?: boolean;
}

// Warna kelas obat
const warnaKelasObat: Record<string, string> = {
  antibiotik: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  antiviral: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  antijamur: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  kardiovaskular: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  respirasi: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  gastrointestinal: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  neurologi: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  psikiatri: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  analgesik: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  antiinflamasi: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  antidiabetes: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  hormonal: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const STORAGE_KEY = 'medref_favorit';

export function DrugCard({ drug, showInteractions = true }: DrugCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const favorites = JSON.parse(stored);
        const found = favorites.find(
          (f: { itemId: string; type: string }) => f.itemId === drug.id && f.type === 'drug'
        );
        setIsFavorite(!!found);
      }
    }
  }, [drug.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const stored = localStorage.getItem(STORAGE_KEY);
    let favorites = stored ? JSON.parse(stored) : [];

    if (isFavorite) {
      favorites = favorites.filter(
        (f: { itemId: string; type: string }) => !(f.itemId === drug.id && f.type === 'drug')
      );
    } else {
      favorites.push({
        id: `fav-${Date.now()}`,
        type: 'drug',
        itemId: drug.id,
        name: drug.name,
        description: drug.genericName || drug.drugClass,
        category: drug.drugClass,
        addedAt: new Date().toISOString(),
      });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  };

  const interactionsCount = drug._count?.interactions || 0;
  const contraindicationsCount = drug._count?.contraindications || 0;

  return (
    <Link 
      href={`/drugs/${drug.id}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
    >
      <Card className="transition-all duration-200 hover:shadow-md active:scale-[0.98] hover:border-primary/20 cursor-pointer h-full group">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="p-2 sm:p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/30 flex-shrink-0">
                <Pill className="h-4 w-4 sm:h-5 sm:w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base truncate">{drug.name}</h3>
                {drug.genericName && (
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {drug.genericName}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                onClick={toggleFavorite}
                aria-label={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
              >
                <Heart
                  className={cn(
                    'h-4 w-4 transition-colors',
                    isFavorite ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'
                  )}
                />
              </Button>
              <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
            </div>
          </div>

          {drug.drugClass && (
            <Badge 
              variant="secondary" 
              className={cn(
                'mt-2.5 sm:mt-3 text-[10px] sm:text-xs capitalize',
                warnaKelasObat[drug.drugClass.toLowerCase()] || 'bg-gray-100 text-gray-700'
              )}
            >
              {drug.drugClass}
            </Badge>
          )}

          {showInteractions && (interactionsCount > 0 || contraindicationsCount > 0) && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2.5 sm:mt-3 text-[10px] sm:text-xs text-muted-foreground">
              {interactionsCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {interactionsCount} interaksi
                </span>
              )}
              {contraindicationsCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {contraindicationsCount} kontraindikasi
                </span>
              )}
            </div>
          )}

          {/* Indikasi utama */}
          {drug.indications && drug.indications.length > 0 && (
            <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-border/50">
              <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                {drug.indications.map(i => i.indication).join(', ')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}