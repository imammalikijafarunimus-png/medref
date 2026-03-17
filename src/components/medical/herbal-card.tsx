'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Leaf, ChevronRight, Heart, FlaskConical, AlertTriangle, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface HerbalCardProps {
  herbal: {
    id: string;
    name: string;
    latinName: string | null;
    commonNames?: string | null;
    localNames?: string | null;
    category?: string | null;
    safetyRating: string | null;
    plantPart?: string | null;
    preparation?: string | null;
    regulatoryStatus?: string | null;
    indications?: { indication: string; evidenceLevel?: string | null }[];
    compounds?: { compoundName: string }[];
    interactions?: { id: string }[];
  };
}

// Warna rating keamanan
const warnaKeamanan: Record<string, string> = {
  aman: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'hati-hati': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'tidak aman': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  'tidak-aman': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  safe: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  caution: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  unsafe: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

// Warna level bukti
const warnaBukti: Record<string, string> = {
  kuat: 'bg-emerald-50 text-emerald-600',
  moderat: 'bg-sky-50 text-sky-600',
  lemah: 'bg-amber-50 text-amber-600',
  tradisional: 'bg-violet-50 text-violet-600',
};

// Warna kategori
const warnaKategori: Record<string, string> = {
  digestive: 'bg-amber-100 text-amber-700',
  immunity: 'bg-emerald-100 text-emerald-700',
  antiinflammatory: 'bg-rose-100 text-rose-700',
  respiratory: 'bg-cyan-100 text-cyan-700',
  nervous: 'bg-indigo-100 text-indigo-700',
  cardiovascular: 'bg-pink-100 text-pink-700',
  metabolic: 'bg-orange-100 text-orange-700',
  'skin-topical': 'bg-violet-100 text-violet-700',
  urinary: 'bg-teal-100 text-teal-700',
  reproductive: 'bg-pink-100 text-pink-700',
  analgesic: 'bg-emerald-100 text-emerald-700',
};

// Label kategori
const labelKategori: Record<string, string> = {
  digestive: 'Pencernaan',
  immunity: 'Imunitas',
  antiinflammatory: 'Antiinflamasi',
  respiratory: 'Respirasi',
  nervous: 'Saraf',
  cardiovascular: 'Kardiovaskular',
  metabolic: 'Metabolik',
  'skin-topical': 'Kulit',
  urinary: 'Urinari',
  reproductive: 'Reproduksi',
  analgesic: 'Analgesik',
};

const STORAGE_KEY = 'medref_favorit';

// Parse JSON or comma-separated strings
function parseNames(str: string | null): string[] {
  if (!str) return [];
  if (str.startsWith('[')) {
    try {
      return JSON.parse(str);
    } catch {
      return str.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

// Get first word for common name
function getShortCommonName(commonNames: string | null | undefined): string | null {
  const names = parseNames(commonNames || null);
  return names.length > 0 ? names[0] : null;
}

export function HerbalCard({ herbal }: HerbalCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const favorites = JSON.parse(stored);
        const found = favorites.find(
          (f: { itemId: string; type: string }) => f.itemId === herbal.id && f.type === 'herbal'
        );
        setIsFavorite(!!found);
      }
    }
  }, [herbal.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const stored = localStorage.getItem(STORAGE_KEY);
    let favorites = stored ? JSON.parse(stored) : [];

    if (isFavorite) {
      favorites = favorites.filter(
        (f: { itemId: string; type: string }) => !(f.itemId === herbal.id && f.type === 'herbal')
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      setIsFavorite(false);
      toast.success('Dihapus dari favorit', {
        description: herbal.name,
      });
    } else {
      favorites.push({
        id: `fav-${Date.now()}`,
        type: 'herbal',
        itemId: herbal.id,
        name: herbal.name,
        description: herbal.latinName,
        category: herbal.category,
        addedAt: new Date().toISOString(),
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      setIsFavorite(true);
      toast.success('Ditambahkan ke favorit', {
        description: herbal.name,
      });
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/herbals/${herbal.id}`;
    const shareTitle = herbal.name;
    const shareText = `${herbal.name}${herbal.latinName ? ` (${herbal.latinName})` : ''} - Obat herbal di MedRef`;

    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast.success('Berhasil membagikan', {
          description: herbal.name,
        });
      } catch (error) {
        // User cancelled or error
        if ((error as Error).name !== 'AbortError') {
          // Fallback to clipboard
          copyToClipboard(shareUrl, herbal.name);
        }
      }
    } else {
      // Fallback to clipboard
      copyToClipboard(shareUrl, herbal.name);
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

  const interactionsCount = herbal.interactions?.length || 0;
  const compoundsCount = herbal.compounds?.length || 0;
  const commonName = getShortCommonName(herbal.commonNames);
  const safetyKey = (herbal.safetyRating || '').toLowerCase().replace(' ', '-');

  return (
    <Link 
      href={`/herbals/${herbal.id}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
    >
      <Card className="transition-all duration-200 hover:shadow-md active:scale-[0.98] hover:border-primary/20 cursor-pointer h-full group">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 shrink-0">
                <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm sm:text-base truncate">{herbal.name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground italic truncate">
                  {herbal.latinName || commonName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                onClick={handleShare}
                aria-label="Bagikan"
                title="Bagikan"
              >
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                onClick={toggleFavorite}
                aria-label={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
                title={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
              >
                <Heart
                  className={cn(
                    'h-4 w-4 transition-colors',
                    isFavorite ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'
                  )}
                />
              </button>
              <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
            </div>
          </div>

          {/* Safety & Category Badges */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {herbal.safetyRating && (
              <Badge 
                variant="secondary" 
                className={cn(
                  'text-[10px] sm:text-xs capitalize',
                  warnaKeamanan[safetyKey] || 'bg-gray-100 text-gray-700'
                )}
              >
                {herbal.safetyRating}
              </Badge>
            )}
            {herbal.category && (
              <Badge 
                variant="outline" 
                className={cn(
                  'text-[10px] sm:text-xs',
                  warnaKategori[herbal.category] || ''
                )}
              >
                {labelKategori[herbal.category] || herbal.category}
              </Badge>
            )}
            {herbal.plantPart && (
              <Badge variant="outline" className="text-[10px]">
                {herbal.plantPart}
              </Badge>
            )}
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2.5 text-[10px] sm:text-xs text-muted-foreground">
            {compoundsCount > 0 && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50">
                <FlaskConical className="h-3 w-3" />
                {compoundsCount} senyawa
              </span>
            )}
            {interactionsCount > 0 && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                {interactionsCount} interaksi
              </span>
            )}
          </div>

          {/* Indikasi utama */}
          {herbal.indications && herbal.indications.length > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-border/50">
              <div className="flex flex-wrap gap-1">
                {herbal.indications.slice(0, 3).map((ind, idx) => (
                  <span key={idx} className="text-[10px] sm:text-xs text-muted-foreground">
                    {typeof ind === 'string' ? ind : ind.indication}
                    {ind.evidenceLevel && (
                      <span className={cn('ml-1 px-1 rounded text-[9px]', warnaBukti[ind.evidenceLevel.toLowerCase()] || '')}>
                        {ind.evidenceLevel}
                      </span>
                    )}
                    {idx < Math.min(herbal.indications!.length, 3) - 1 && ', '}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}