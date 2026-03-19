'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { FavoritesTabs } from '@/components/favorites/favorites-tabs';
import type { FavoriteDrug, FavoriteHerbal, FavoriteNote } from '@/components/favorites/types';

// Mock data for demonstration - in production, fetch from API
const mockDrugs: FavoriteDrug[] = [
  {
    id: '1',
    name: 'Amoxicillin',
    genericName: 'Amoxicillin Trihydrate',
    category: 'Antibiotik',
    drugClass: 'Penicillin',
    favoriteId: 'fav1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    category: 'Analgesik',
    drugClass: 'Non-opioid',
    favoriteId: 'fav2',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Metformin',
    genericName: 'Metformin HCl',
    category: 'Antidiabetik',
    drugClass: 'Biguanide',
    favoriteId: 'fav3',
    createdAt: new Date().toISOString(),
  },
];

const mockHerbals: FavoriteHerbal[] = [
  {
    id: '1',
    name: 'Jahe',
    latinName: 'Zingiber officinale',
    category: 'Pencernaan',
    benefit: 'Membantu meredakan mual, muntah, dan gangguan pencernaan',
    favoriteId: 'fav4',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Kunyit',
    latinName: 'Curcuma longa',
    category: 'Antiinflamasi',
    benefit: 'Memiliki efek antiinflamasi dan antioksidan',
    favoriteId: 'fav5',
    createdAt: new Date().toISOString(),
  },
];

const mockNotes: FavoriteNote[] = [
  {
    id: '1',
    title: 'Panduan Dosis Antibiotik',
    category: 'Farmakologi',
    specialty: 'Internal',
    content: 'Panduan lengkap tentang dosis antibiotik untuk berbagai kondisi infeksi...',
    favoriteId: 'fav6',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Algoritma Hipertensi',
    category: 'Kardiologi',
    specialty: 'Internal',
    content: 'Langkah diagnosis dan tatalaksana hipertensi berdasarkan panduan terbaru...',
    favoriteId: 'fav7',
    createdAt: new Date().toISOString(),
  },
];

export default function FavoritesPage() {
  const router = useRouter();
  const [drugs, setDrugs] = useState<FavoriteDrug[]>([]);
  const [herbals, setHerbals] = useState<FavoriteHerbal[]>([]);
  const [notes, setNotes] = useState<FavoriteNote[]>([]);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Fetch favorites on mount
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        // In production, replace with actual API call:
        // const response = await fetch('/api/favorites');
        // const data = await response.json();
        // setDrugs(data.drugs);
        // setHerbals(data.herbals);
        // setNotes(data.notes);

        // Using mock data for demonstration
        await new Promise((resolve) => setTimeout(resolve, 500));
        setDrugs(mockDrugs);
        setHerbals(mockHerbals);
        setNotes(mockNotes);
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
        toast.error('Gagal memuat favorit');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // Remove drug from favorites
  const handleRemoveDrug = useCallback(async (drugId: string) => {
    const drug = drugs.find((d) => d.id === drugId);
    if (!drug) return;

    // Optimistic update
    setRemovingIds((prev) => new Set(prev).add(drugId));

    try {
      // In production, call API:
      // await fetch(`/api/favorites/${drug.favoriteId}`, { method: 'DELETE' });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      setDrugs((prev) => prev.filter((d) => d.id !== drugId));
      toast.success(`${drug.name} dihapus dari favorit`, {
        action: {
          label: 'Undo',
          onClick: () => {
            setDrugs((prev) => [...prev, drug]);
            toast.success(`${drug.name} dikembalikan ke favorit`);
          },
        },
      });
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      toast.error('Gagal menghapus favorit');
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(drugId);
        return next;
      });
    }
  }, [drugs]);

  // Remove herbal from favorites
  const handleRemoveHerbal = useCallback(async (herbalId: string) => {
    const herbal = herbals.find((h) => h.id === herbalId);
    if (!herbal) return;

    // Optimistic update
    setRemovingIds((prev) => new Set(prev).add(herbalId));

    try {
      // In production, call API:
      // await fetch(`/api/favorites/${herbal.favoriteId}`, { method: 'DELETE' });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      setHerbals((prev) => prev.filter((h) => h.id !== herbalId));
      toast.success(`${herbal.name} dihapus dari favorit`, {
        action: {
          label: 'Undo',
          onClick: () => {
            setHerbals((prev) => [...prev, herbal]);
            toast.success(`${herbal.name} dikembalikan ke favorit`);
          },
        },
      });
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      toast.error('Gagal menghapus favorit');
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(herbalId);
        return next;
      });
    }
  }, [herbals]);

  // Remove note from favorites
  const handleRemoveNote = useCallback(async (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    // Optimistic update
    setRemovingIds((prev) => new Set(prev).add(noteId));

    try {
      // In production, call API:
      // await fetch(`/api/favorites/${note.favoriteId}`, { method: 'DELETE' });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      toast.success(`"${note.title}" dihapus dari favorit`, {
        action: {
          label: 'Undo',
          onClick: () => {
            setNotes((prev) => [...prev, note]);
            toast.success(`"${note.title}" dikembalikan ke favorit`);
          },
        },
      });
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      toast.error('Gagal menghapus favorit');
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(noteId);
        return next;
      });
    }
  }, [notes]);

  // Navigate to detail pages
  const handleDrugClick = useCallback((drugId: string) => {
    router.push(`/drugs/${drugId}`);
  }, [router]);

  const handleHerbalClick = useCallback((herbalId: string) => {
    router.push(`/herbals/${herbalId}`);
  }, [router]);

  const handleNoteClick = useCallback((noteId: string) => {
    router.push(`/notes/${noteId}`);
  }, [router]);

  const totalFavorites = drugs.length + herbals.length + notes.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-card-foreground">Favorit</h1>
              <p className="text-sm text-muted-foreground">
                {totalFavorites} item tersimpan
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-5xl mx-auto px-4 py-6">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-4">
            <div className="h-12 w-full max-w-lg bg-muted animate-pulse rounded-lg" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
        ) : totalFavorites === 0 ? (
          // Empty state for all
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Belum ada favorit
            </h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              Simpan obat, herbal, atau catatan favorit Anda untuk akses cepat
            </p>
          </div>
        ) : (
          <FavoritesTabs
            drugs={drugs}
            herbals={herbals}
            notes={notes}
            removingIds={removingIds}
            onRemoveDrug={handleRemoveDrug}
            onRemoveHerbal={handleRemoveHerbal}
            onRemoveNote={handleRemoveNote}
            onDrugClick={handleDrugClick}
            onHerbalClick={handleHerbalClick}
            onNoteClick={handleNoteClick}
          />
        )}
      </main>
    </div>
  );
}