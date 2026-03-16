'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, Pill, Leaf, FileText, Activity, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SearchResult, GroupedSearchResults } from '@/types';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
}

// Konfigurasi kategori
const konfigurasiKategori = {
  drug: {
    icon: Pill,
    label: 'Obat',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  herbal: {
    icon: Leaf,
    label: 'Herbal',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    badgeColor: 'bg-green-100 text-green-700',
  },
  symptom: {
    icon: Activity,
    label: 'Gejala',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    badgeColor: 'bg-amber-100 text-amber-700',
  },
  note: {
    icon: FileText,
    label: 'Catatan',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
};

export function SearchBar({
  placeholder = 'Cari obat, herbal, catatan...',
  className,
  autoFocus = false,
  onSearch,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [hasilGrup, setHasilGrup] = useState<GroupedSearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [tampilkanHasil, setTampilkanHasil] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click di luar untuk menutup hasil
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setTampilkanHasil(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Pencarian dengan debounce
  const lakukanPencarian = useCallback(async (kataKunci: string) => {
    if (kataKunci.trim().length < 2) {
      setHasilGrup(null);
      setTampilkanHasil(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(kataKunci)}&grouped=true&limit=20`
      );
      const data = await res.json();
      if (data.success) {
        setHasilGrup(data.data);
        setTampilkanHasil(true);
      }
    } catch (error) {
      console.error('Error pencarian:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      lakukanPencarian(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, lakukanPencarian]);

  const handleKlikHasil = (hasil: SearchResult) => {
    setTampilkanHasil(false);
    setQuery('');

    const rute: Record<string, string> = {
      drug: '/drugs',
      herbal: '/herbals',
      note: '/notes',
      symptom: '/symptoms',
    };

    router.push(`${rute[hasil.type]}/${hasil.id}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setTampilkanHasil(false);
      if (onSearch) {
        onSearch(query.trim());
      } else {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setTampilkanHasil(false);
      inputRef.current?.blur();
    }
  };

  const adaHasil = hasilGrup && hasilGrup.totalResults > 0;

  // Render item hasil
  const renderItemHasil = (hasil: SearchResult, terakhir: boolean) => {
    const config = konfigurasiKategori[hasil.type];
    const Icon = config.icon;

    return (
      <button
        key={`${hasil.type}-${hasil.id}`}
        className={cn(
          'w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 text-left transition-colors',
          !terakhir && 'border-b border-border/50'
        )}
        onClick={() => handleKlikHasil(hasil)}
      >
        <div className={cn('p-2 rounded-lg', config.bgColor)}>
          <Icon className={cn('h-4 w-4', config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{hasil.name}</div>
          {hasil.description && (
            <div className="text-sm text-muted-foreground truncate">
              {hasil.description}
            </div>
          )}
        </div>
        {hasil.matchType === 'fuzzy' && (
          <Badge variant="outline" className="text-xs">
            Mirip
          </Badge>
        )}
      </button>
    );
  };

  // Render section kategori
  const renderSectionKategori = (
    type: 'drug' | 'herbal' | 'symptom' | 'note',
    hasil: SearchResult[]
  ) => {
    if (hasil.length === 0) return null;

    const config = konfigurasiKategori[type];
    const Icon = config.icon;

    return (
      <div className="border-b border-border last:border-b-0">
        <div className={cn('px-4 py-2 flex items-center gap-2 border-b', config.bgColor)}>
          <Icon className={cn('h-4 w-4', config.color)} />
          <span className={cn('font-medium text-sm', config.color)}>
            {config.label}
          </span>
          <Badge variant="secondary" className="ml-auto text-xs">
            {hasil.length}
          </Badge>
        </div>
        <div>
          {hasil.map((item, idx) => renderItemHasil(item, idx === hasil.length - 1))}
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => adaHasil && setTampilkanHasil(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="pl-10 pr-10 h-12 text-base"
          aria-label="Pencarian"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => {
              setQuery('');
              setHasilGrup(null);
              inputRef.current?.focus();
            }}
            aria-label="Hapus pencarian"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </form>

      {/* Dropdown Hasil Pencarian */}
      {tampilkanHasil && hasilGrup && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-[70vh] overflow-y-auto"
          role="listbox"
        >
          {adaHasil ? (
            <>
              {renderSectionKategori('drug', hasilGrup.drugs)}
              {renderSectionKategori('herbal', hasilGrup.herbals)}
              {renderSectionKategori('symptom', hasilGrup.symptoms)}
              {renderSectionKategori('note', hasilGrup.notes)}
              
              {/* Footer lihat semua hasil */}
              <button
                className="w-full px-4 py-3 flex items-center justify-center gap-2 hover:bg-muted/50 text-sm text-muted-foreground transition-colors"
                onClick={handleSubmit}
              >
                <span>Lihat semua {hasilGrup.totalResults} hasil</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="px-4 py-8 text-center">
              <Search className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">Tidak ada hasil untuk "{query}"</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Coba kata kunci lain atau periksa ejaan
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}