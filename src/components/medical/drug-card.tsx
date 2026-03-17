'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pill, ChevronRight, Heart, AlertTriangle, Shield, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Drug } from '@prisma/client';
import { toast } from 'sonner';

// Extended Drug type with relations
type DrugWithRelations = Drug & {
  doses?: { id: string; indication: string | null; adultDose: string }[];
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

// Warna kategori obat
const warnaKategori: Record<string, string> = {
  analgesic: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  antibiotic: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  antibiotik: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  antiviral: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  antifungal: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  antihypertensive: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  cardiovascular: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  kardiovaskular: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  respiratory: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  respirasi: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  gastrointestinal: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  neurology: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  neurologi: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  psychiatry: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  psikiatri: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  antidiabetic: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  endocrine: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  hormonal: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  diuretic: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  anticoagulant: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  antiarrhythmic: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  'lipid-lowering': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  antianginal: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  antimigraine: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  antigout: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  antihistamine: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  antiemetic: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  laxative: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',
  thyroid: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  corticosteroid: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
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
          (f: { itemId: string; type: string }) =>
            f.itemId === drug.id && f.type === 'drug'
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
        (f: { itemId: string; type: string }) =>
          !(f.itemId === drug.id && f.type === 'drug')
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      setIsFavorite(false);
      toast.success('Dihapus dari favorit', {
        description: drug.name,
      });
    } else {
      favorites.push({
        id: `fav-${Date.now()}`,
        type: 'drug',
        itemId: drug.id,
        name: drug.name,
        description:
          drug.genericName ||
          drug.description?.slice(0, 50) ||
          drug.drugClass,
        category: drug.category || drug.drugClass,
        addedAt: new Date().toISOString(),
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      setIsFavorite(true);
      toast.success('Ditambahkan ke favorit', {
        description: drug.name,
      });
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/drugs/${drug.id}`;
    const shareTitle = drug.name;
    const shareText = `${drug.name}${drug.genericName ? ` (${drug.genericName})` : ''} - ${drug.description?.slice(0, 100) || drug.drugClass || 'Informasi obat lengkap'} di MedRef`;

    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast.success('Berhasil membagikan', {
          description: drug.name,
        });
      } catch (error) {
        // User cancelled or error
        if ((error as Error).name !== 'AbortError') {
          // Fallback to clipboard
          copyToClipboard(shareUrl, drug.name);
        }
      }
    } else {
      // Fallback to clipboard
      copyToClipboard(shareUrl, drug.name);
    }
  };

  const copyToClipboard = async (url: string, name: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link disalin ke clipboard', {
        description: `Link ${name} berhasil disalin`,
      });
    } catch {
      toast.error('Gagal menyalin link', {
        description: 'Silakan salin secara manual',
      });
    }
  };

  const interactionsCount = drug._count?.interactions || 0;
  const contraindicationsCount = drug._count?.contraindications || 0;
  const categoryKey = (drug.category || drug.drugClass || '').toLowerCase();

  return (
    <Link
      href={`/drugs/${drug.id}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
    >
      <Card className="transition-all duration-200 hover:shadow-md active:scale-[0.98] hover:border-primary/20 cursor-pointer h-full group">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="p-2 sm:p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/30 flex-shrink-0">
                <Pill className="h-4 w-4 sm:h-5 sm:w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm sm:text-base truncate">
                  {drug.name}
                </h3>
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
                onClick={handleShare}
                title="Bagikan"
              >
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                onClick={toggleFavorite}
                title={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
              >
                <Heart
                  className={cn(
                    'h-4 w-4',
                    isFavorite
                      ? 'fill-rose-500 text-rose-500'
                      : 'text-muted-foreground'
                  )}
                />
              </Button>
              <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {(drug.category || drug.drugClass) && (
              <Badge
                variant="secondary"
                className={cn(
                  'text-[10px] sm:text-xs capitalize',
                  warnaKategori[categoryKey] ||
                    'bg-gray-100 text-gray-700'
                )}
              >
                {drug.category || drug.drugClass}
              </Badge>
            )}
          </div>

          {/* Description */}
          {drug.description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {drug.description}
            </p>
          )}

          {/* Interactions */}
          {showInteractions &&
            (interactionsCount > 0 ||
              contraindicationsCount > 0) && (
              <div className="flex gap-2 mt-2 text-xs">
                {interactionsCount > 0 && (
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                    {interactionsCount}
                  </span>
                )}
                {contraindicationsCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-rose-500" />
                    {contraindicationsCount}
                  </span>
                )}
              </div>
            )}

          {/* Indications */}
          {(drug.indications?.length ?? 0) > 0 && (
            <p className="text-xs mt-2 text-muted-foreground">
              {drug.indications?.map((i) => i.indication).join(', ')}
            </p>
          )}

          {/* Dosage */}
          {(drug.doses?.length ?? 0) > 0 && (
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-[10px] font-medium text-muted-foreground">
                Dosis:
              </p>
              <ul className="text-[10px] text-muted-foreground">
                {drug.doses?.slice(0, 2).map((d) => (
                  <li key={d.id}>
                    • {d.adultDose}
                    {d.indication && ` (${d.indication})`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}