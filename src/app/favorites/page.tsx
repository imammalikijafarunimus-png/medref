'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Pill, Leaf, FileText, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyFavorites } from '@/components/medical';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FavoriteItem {
  id: string;
  type: 'drug' | 'herbal' | 'note';
  itemId: string;
  name: string;
  description?: string;
  category?: string;
  addedAt: string;
}

const iconMap = {
  drug: Pill,
  herbal: Leaf,
  note: FileText,
};

const colorMap = {
  drug: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400' },
  herbal: { bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-600 dark:text-green-400' },
  note: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-600 dark:text-purple-400' },
};

const STORAGE_KEY = 'medref_favorit';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  const removeFavorite = (itemId: string, type: string, name: string) => {
    const item = favorites.find((f) => f.itemId === itemId && f.type === type);
    const updated = favorites.filter(
      (f) => !(f.itemId === itemId && f.type === type)
    );
    setFavorites(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    toast.success('Dihapus dari favorit', {
      description: name,
    });
  };

  const filteredFavorites = activeTab === 'all' 
    ? favorites 
    : favorites.filter((f) => f.type === activeTab);

  const groupedFavorites = {
    drug: favorites.filter((f) => f.type === 'drug'),
    herbal: favorites.filter((f) => f.type === 'herbal'),
    note: favorites.filter((f) => f.type === 'note'),
  };

  if (favorites.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30">
            <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Favorit</h1>
            <p className="text-muted-foreground">
              Item tersimpan Anda
            </p>
          </div>
        </div>
        <EmptyFavorites />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30">
          <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Favorit</h1>
          <p className="text-muted-foreground">
            {favorites.length} item tersimpan
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            Semua ({favorites.length})
          </TabsTrigger>
          <TabsTrigger value="drug">
            Obat ({groupedFavorites.drug.length})
          </TabsTrigger>
          <TabsTrigger value="herbal">
            Herbal ({groupedFavorites.herbal.length})
          </TabsTrigger>
          <TabsTrigger value="note">
            Catatan ({groupedFavorites.note.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredFavorites.map((item) => {
              const Icon = iconMap[item.type];
              const colors = colorMap[item.type];

              return (
                <Card key={`${item.type}-${item.itemId}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/${item.type === 'drug' ? 'drugs' : item.type === 'herbal' ? 'herbals' : 'notes'}/${item.itemId}`}
                        className="flex items-center gap-3 min-w-0 flex-1"
                      >
                        <div className={cn('p-2 rounded-lg flex-shrink-0', colors.bg)}>
                          <Icon className={cn('h-4 w-4', colors.text)} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium truncate">{item.name}</h3>
                          {item.description && (
                            <p className="text-sm text-muted-foreground truncate">
                              {item.description}
                            </p>
                          )}
                          {item.category && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFavorite(item.itemId, item.type, item.name)}
                        className="text-muted-foreground hover:text-red-500"
                        aria-label="Hapus dari favorit"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}