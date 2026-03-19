'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { FavoritesTabs } from '@/components/favorites/favorites-tabs';
import type { FavoriteDrug, FavoriteHerbal, FavoriteNote } from '@/components/favorites/types';

export default function FavoritesPage() {
  const router = useRouter();
  const [drugs, setDrugs] = useState<FavoriteDrug[]>([]);
  const [herbals, setHerbals] = useState<FavoriteHerbal[]>([]);
  const [notes, setNotes] = useState<FavoriteNote[]>([]);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // ✅ FIX: Fetch real favorites from API — no more mock data
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch('/api/favorites');
        if (!response.ok) throw new Error('Failed to fetch');
        const data: Array<
          | (FavoriteDrug & { type: 'drug' })
          | (FavoriteHerbal & { type: 'herbal' })
          | (FavoriteNote & { type: 'note' })
        > = await response.json();

        // ✅ FIX: Split flat array by type into typed state
        setDrugs(data.filter((item): item is FavoriteDrug & { type: 'drug' } => item.type === 'drug'));
        setHerbals(data.filter((item): item is FavoriteHerbal & { type: 'herbal' } => item.type === 'herbal'));
        setNotes(data.filter((item): item is FavoriteNote & { type: 'note' } => item.type === 'note'));
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
        toast.error('Gagal memuat favorit');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemoveDrug = useCallback(async (drugId: string) => {
    const drug = drugs.find((d) => d.id === drugId);
    if (!drug) return;

    setRemovingIds((prev) => new Set(prev).add(drugId));

    try {
      const res = await fetch(`/api/favorites/${drug.favoriteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');

      setDrugs((prev) => prev.filter((d) => d.id !== drugId));
      toast.success(`${drug.name} dihapus dari favorit`, {
        action: {
          label: 'Undo',
          onClick: async () => {
            await fetch('/api/favorites', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ itemId: drugId, itemType: 'drug' }),
            });
            setDrugs((prev) => [...prev, drug]);
            toast.success(`${drug.name} dikembalikan ke favorit`);
          },
        },
      });
    } catch {
      toast.error('Gagal menghapus favorit');
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(drugId);
        return next;
      });
    }
  }, [drugs]);

  const handleRemoveHerbal = useCallback(async (herbalId: string) => {
    const herbal = herbals.find((h) => h.id === herbalId);
    if (!herbal) return;

    setRemovingIds((prev) => new Set(prev).add(herbalId));

    try {
      const res = await fetch(`/api/favorites/${herbal.favoriteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');

      setHerbals((prev) => prev.filter((h) => h.id !== herbalId));
      toast.success(`${herbal.name} dihapus dari favorit`, {
        action: {
          label: 'Undo',
          onClick: async () => {
            await fetch('/api/favorites', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ itemId: herbalId, itemType: 'herbal' }),
            });
            setHerbals((prev) => [...prev, herbal]);
            toast.success(`${herbal.name} dikembalikan ke favorit`);
          },
        },
      });
    } catch {
      toast.error('Gagal menghapus favorit');
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(herbalId);
        return next;
      });
    }
  }, [herbals]);

  const handleRemoveNote = useCallback(async (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    setRemovingIds((prev) => new Set(prev).add(noteId));

    try {
      const res = await fetch(`/api/favorites/${note.favoriteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');

      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      toast.success(`"${note.title}" dihapus dari favorit`, {
        action: {
          label: 'Undo',
          onClick: async () => {
            await fetch('/api/favorites', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ itemId: noteId, itemType: 'note' }),
            });
            setNotes((prev) => [...prev, note]);
            toast.success(`"${note.title}" dikembalikan ke favorit`);
          },
        },
      });
    } catch {
      toast.error('Gagal menghapus favorit');
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(noteId);
        return next;
      });
    }
  }, [notes]);

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
      {/* ── Premium Header ── */}
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/75 backdrop-blur-xl backdrop-saturate-150">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {/* Icon with animated pulse ring */}
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-rose-500/20 animate-ping [animation-duration:2.5s]" />
                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500/15 to-rose-600/25 border border-rose-500/20 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500/80" />
                </div>
              </div>
              <div>
                <h1 className="text-[15px] font-semibold tracking-tight text-foreground">
                  Favorit Saya
                </h1>
                <p className="text-[11px] text-muted-foreground leading-none mt-0.5">
                  {isLoading ? 'Memuat…' : totalFavorites === 0
                    ? 'Belum ada yang disimpan'
                    : `${totalFavorites} item tersimpan`}
                </p>
              </div>
            </div>

            {/* Decorative badge */}
            {!isLoading && totalFavorites > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/8 border border-rose-500/15">
                <Sparkles className="w-3 h-3 text-rose-500/70" />
                <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                  Koleksi Anda
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="container max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <LoadingSkeleton />
        ) : totalFavorites === 0 ? (
          <EmptyState />
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

/* ── Subcomponents ── */

function LoadingSkeleton() {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Tab bar skeleton */}
      <div className="flex gap-2">
        {[80, 64, 72].map((w, i) => (
          <div
            key={i}
            className="h-8 rounded-full bg-muted/60 animate-pulse"
            style={{ width: `${w}px` }}
          />
        ))}
      </div>
      {/* Card skeletons */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[100px] rounded-2xl bg-muted/40 animate-pulse"
            style={{ animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Layered icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-rose-500/8 border border-rose-500/15 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/12 border border-rose-500/20 flex items-center justify-center">
            <Heart className="w-6 h-6 text-rose-400/60" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <h3 className="text-base font-semibold text-foreground mb-1.5">
        Belum ada favorit
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        Ketuk ikon hati pada obat, herbal, atau catatan untuk menyimpannya di sini.
      </p>
    </div>
  );
}