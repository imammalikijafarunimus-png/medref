'use client';

import { memo } from 'react';
import { Pill, Leaf, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FavoriteDrugCard } from './favorite-drug-card';
import { FavoriteHerbalCard } from './favorite-herbal-card';
import { FavoriteNoteCard } from './favorite-note-card';
import { FavoritesEmptyState } from './favorites-empty-state';
import type { FavoriteDrug, FavoriteHerbal, FavoriteNote } from './types';

interface FavoritesTabsProps {
  drugs: FavoriteDrug[];
  herbals: FavoriteHerbal[];
  notes: FavoriteNote[];
  removingIds: Set<string>;
  onRemoveDrug: (drugId: string) => void;
  onRemoveHerbal: (herbalId: string) => void;
  onRemoveNote: (noteId: string) => void;
  onDrugClick: (drugId: string) => void;
  onHerbalClick: (herbalId: string) => void;
  onNoteClick: (noteId: string) => void;
}

export const FavoritesTabs = memo(function FavoritesTabs({
  drugs,
  herbals,
  notes,
  removingIds,
  onRemoveDrug,
  onRemoveHerbal,
  onRemoveNote,
  onDrugClick,
  onHerbalClick,
  onNoteClick,
}: FavoritesTabsProps) {
  const hasDrugs = drugs.length > 0;
  const hasHerbals = herbals.length > 0;
  const hasNotes = notes.length > 0;

  // Determine default tab based on content
  const getDefaultTab = () => {
    if (hasDrugs) return 'drugs';
    if (hasHerbals) return 'herbals';
    if (hasNotes) return 'notes';
    return 'drugs';
  };

  return (
    <Tabs defaultValue={getDefaultTab()} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6 h-auto p-1">
        <TabsTrigger
          value="drugs"
          className="flex items-center gap-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Pill className="h-4 w-4" />
          <span className="hidden sm:inline">Obat</span>
          <span className="sm:hidden">Obat</span>
          {drugs.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-muted-foreground/20">
              {drugs.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="herbals"
          className="flex items-center gap-2 py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
        >
          <Leaf className="h-4 w-4" />
          <span className="hidden sm:inline">Herbal</span>
          <span className="sm:hidden">Herbal</span>
          {herbals.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-muted-foreground/20">
              {herbals.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="notes"
          className="flex items-center gap-2 py-2 data-[state=active]:bg-amber-600 data-[state=active]:text-white"
        >
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Catatan</span>
          <span className="sm:hidden">Catatan</span>
          {notes.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-muted-foreground/20">
              {notes.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      {/* Drugs Tab Content */}
      <TabsContent value="drugs" className="mt-0 focus-visible:outline-none">
        {hasDrugs ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {drugs.map((drug) => (
              <FavoriteDrugCard
                key={drug.id}
                drug={drug}
                onRemove={onRemoveDrug}
                onClick={onDrugClick}
                isRemoving={removingIds.has(drug.id)}
              />
            ))}
          </div>
        ) : (
          <FavoritesEmptyState type="drug" />
        )}
      </TabsContent>

      {/* Herbals Tab Content */}
      <TabsContent value="herbals" className="mt-0 focus-visible:outline-none">
        {hasHerbals ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {herbals.map((herbal) => (
              <FavoriteHerbalCard
                key={herbal.id}
                herbal={herbal}
                onRemove={onRemoveHerbal}
                onClick={onHerbalClick}
                isRemoving={removingIds.has(herbal.id)}
              />
            ))}
          </div>
        ) : (
          <FavoritesEmptyState type="herbal" />
        )}
      </TabsContent>

      {/* Notes Tab Content */}
      <TabsContent value="notes" className="mt-0 focus-visible:outline-none">
        {hasNotes ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <FavoriteNoteCard
                key={note.id}
                note={note}
                onRemove={onRemoveNote}
                onClick={onNoteClick}
                isRemoving={removingIds.has(note.id)}
              />
            ))}
          </div>
        ) : (
          <FavoritesEmptyState type="note" />
        )}
      </TabsContent>
    </Tabs>
  );
});