'use client';

import { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  itemId: string;
  itemName: string;
  itemType?: 'drug' | 'herbal';
}

export function FavoriteButton({ itemId, itemName, itemType = 'drug' }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  // Fetch status favorit saat pertama kali mount
  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch(`/api/favorites/${itemId}?itemType=${itemType}`);
        if (res.ok) {
          const data = await res.json();
          setIsFavorite(data.isFavorite);
          setFavoriteId(data.favoriteId);
        }
      } catch (error) {
        console.error('Error fetching favorite status:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStatus();
  }, [itemId, itemType]);

  // Toggle favorit (Tambah/Hapus)
  const handleToggle = useCallback(async () => {
    if (isToggling) return;
    setIsToggling(true);

    try {
      if (isFavorite && favoriteId) {
        // Hapus dari favorit
        const res = await fetch(`/api/favorites/${favoriteId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');
        setIsFavorite(false);
        setFavoriteId(null);
        toast.success(`${itemName} dihapus dari favorit`);
      } else {
        // Tambah ke favorit
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, itemType }),
        });
        if (!res.ok) throw new Error('Post failed');
        const data = await res.json();
        setIsFavorite(true);
        setFavoriteId(data.id || data.favoriteId);
        toast.success(`${itemName} ditambahkan ke favorit`);
      }
    } catch {
      toast.error('Gagal mengubah favorit');
    } finally {
      setIsToggling(false);
    }
  }, [isFavorite, favoriteId, isToggling, itemName, itemId, itemType]);

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-9 w-9 p-0"
      onClick={handleToggle}
      disabled={isLoading || isToggling}
      aria-label={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-all duration-200',
          isFavorite ? 'fill-rose-500 text-rose-500 hover:text-rose-600' : 'text-muted-foreground hover:text-rose-500'
        )}
      />
    </Button>
  );
}