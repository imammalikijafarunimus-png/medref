'use client';

import { useState, memo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Pill, Leaf, FileText, Heart, Trash2, ChevronRight,
  FlaskConical, Tag, Baby, BookOpen, Stethoscope,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FavoriteDrug, FavoriteHerbal, FavoriteNote } from './types';

interface FavoritesTabsProps {
  drugs: FavoriteDrug[];
  herbals: FavoriteHerbal[];
  notes: FavoriteNote[];
  removingIds: Set<string>;
  onRemoveDrug: (id: string) => void;
  onRemoveHerbal: (id: string) => void;
  onRemoveNote: (id: string) => void;
  onDrugClick: (id: string) => void;
  onHerbalClick: (id: string) => void;
  onNoteClick: (id: string) => void;
}

type TabKey = 'drugs' | 'herbals' | 'notes';

export const FavoritesTabs = memo(function FavoritesTabs({
  drugs, herbals, notes,
  removingIds,
  onRemoveDrug, onRemoveHerbal, onRemoveNote,
  onDrugClick, onHerbalClick, onNoteClick,
}: FavoritesTabsProps) {
  const defaultTab: TabKey = drugs.length > 0 ? 'drugs' : herbals.length > 0 ? 'herbals' : 'notes';
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count: number; accent: string; activeClass: string }[] = [
    {
      key: 'drugs',
      label: 'Obat',
      icon: <Pill className="h-3.5 w-3.5" />,
      count: drugs.length,
      accent: 'blue',
      activeClass: 'bg-blue-500/12 text-blue-700 dark:text-blue-400 border-blue-500/25',
    },
    {
      key: 'herbals',
      label: 'Herbal',
      icon: <Leaf className="h-3.5 w-3.5" />,
      count: herbals.length,
      accent: 'emerald',
      activeClass: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
    },
    {
      key: 'notes',
      label: 'Catatan',
      icon: <FileText className="h-3.5 w-3.5" />,
      count: notes.length,
      accent: 'amber',
      activeClass: 'bg-amber-500/12 text-amber-700 dark:text-amber-400 border-amber-500/25',
    },
  ];

  return (
    <div className="space-y-4">
      {/* ── Tab pills ── */}
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150',
                isActive
                  ? tab.activeClass
                  : 'bg-transparent text-muted-foreground border-border/60 hover:border-border hover:text-foreground'
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.count > 0 && (
                <span className={cn(
                  'ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center',
                  isActive ? 'bg-current/15' : 'bg-muted text-muted-foreground'
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      <div className="animate-in fade-in duration-200">
        {activeTab === 'drugs' && (
          <DrugList drugs={drugs} removingIds={removingIds} onRemove={onRemoveDrug} onClick={onDrugClick} />
        )}
        {activeTab === 'herbals' && (
          <HerbalList herbals={herbals} removingIds={removingIds} onRemove={onRemoveHerbal} onClick={onHerbalClick} />
        )}
        {activeTab === 'notes' && (
          <NoteList notes={notes} removingIds={removingIds} onRemove={onRemoveNote} onClick={onNoteClick} />
        )}
      </div>
    </div>
  );
});

// ── Drug list ─────────────────────────────────────────────────────────────────
function DrugList({ drugs, removingIds, onRemove, onClick }: {
  drugs: FavoriteDrug[];
  removingIds: Set<string>;
  onRemove: (id: string) => void;
  onClick: (id: string) => void;
}) {
  if (drugs.length === 0) return <EmptyTab icon={<Pill />} label="obat" href="/drugs" />;

  return (
    <div className="space-y-2">
      {drugs.map((drug) => (
        <div
          key={drug.id}
          className={cn(
            'group relative flex items-start gap-3.5 p-4 rounded-2xl border border-border/60 bg-card',
            'hover:border-blue-500/30 hover:bg-blue-500/3 transition-all duration-150 cursor-pointer',
            removingIds.has(drug.id) && 'opacity-50 pointer-events-none'
          )}
          onClick={() => onClick(drug.id)}
        >
          {/* Icon */}
          <div className="shrink-0 w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center mt-0.5">
            <Pill className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{drug.name}</p>
            {drug.genericName && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{drug.genericName}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {drug.drugClass && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/8 text-blue-700 dark:text-blue-400 border border-blue-500/15">
                  <FlaskConical className="h-2.5 w-2.5" />
                  {drug.drugClass}
                </span>
              )}
              {drug.category && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border/50">
                  <Tag className="h-2.5 w-2.5" />
                  {drug.category}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0 self-center">
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(drug.id); }}
              className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all duration-150"
              aria-label="Hapus dari favorit"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Herbal list ───────────────────────────────────────────────────────────────
function HerbalList({ herbals, removingIds, onRemove, onClick }: {
  herbals: FavoriteHerbal[];
  removingIds: Set<string>;
  onRemove: (id: string) => void;
  onClick: (id: string) => void;
}) {
  if (herbals.length === 0) return <EmptyTab icon={<Leaf />} label="herbal" href="/herbals" />;

  return (
    <div className="space-y-2">
      {herbals.map((herbal) => (
        <div
          key={herbal.id}
          className={cn(
            'group relative flex items-start gap-3.5 p-4 rounded-2xl border border-border/60 bg-card',
            'hover:border-emerald-500/30 hover:bg-emerald-500/3 transition-all duration-150 cursor-pointer',
            removingIds.has(herbal.id) && 'opacity-50 pointer-events-none'
          )}
          onClick={() => onClick(herbal.id)}
        >
          <div className="shrink-0 w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center mt-0.5">
            <Leaf className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{herbal.name}</p>
            {herbal.latinName && (
              <p className="text-xs text-muted-foreground italic mt-0.5 truncate">{herbal.latinName}</p>
            )}
            {herbal.benefit && (
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{herbal.benefit}</p>
            )}
            {herbal.category && (
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/8 text-emerald-700 dark:text-emerald-400 border border-emerald-500/15">
                <Tag className="h-2.5 w-2.5" />
                {herbal.category}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 self-center">
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(herbal.id); }}
              className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all duration-150"
              aria-label="Hapus dari favorit"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Note list ─────────────────────────────────────────────────────────────────
function NoteList({ notes, removingIds, onRemove, onClick }: {
  notes: FavoriteNote[];
  removingIds: Set<string>;
  onRemove: (id: string) => void;
  onClick: (id: string) => void;
}) {
  if (notes.length === 0) return <EmptyTab icon={<FileText />} label="catatan" href="/notes" />;

  return (
    <div className="space-y-2">
      {notes.map((note) => (
        <div
          key={note.id}
          className={cn(
            'group relative flex items-start gap-3.5 p-4 rounded-2xl border border-border/60 bg-card',
            'hover:border-amber-500/30 hover:bg-amber-500/3 transition-all duration-150 cursor-pointer',
            removingIds.has(note.id) && 'opacity-50 pointer-events-none'
          )}
          onClick={() => onClick(note.id)}
        >
          <div className="shrink-0 w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center mt-0.5">
            <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{note.title}</p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {note.specialty && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/8 text-amber-700 dark:text-amber-400 border border-amber-500/15">
                  <Stethoscope className="h-2.5 w-2.5" />
                  {note.specialty}
                </span>
              )}
              {note.category && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border/50">
                  <BookOpen className="h-2.5 w-2.5" />
                  {note.category}
                </span>
              )}
            </div>
            {note.content && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{note.content}</p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 self-center">
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(note.id); }}
              className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all duration-150"
              aria-label="Hapus dari favorit"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Empty state per tab ───────────────────────────────────────────────────────
function EmptyTab({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center mb-3 text-muted-foreground/40">
        {icon}
      </div>
      <p className="text-sm font-medium text-foreground mb-1">Belum ada {label} favorit</p>
      <p className="text-xs text-muted-foreground mb-4">
        Tap ikon <Heart className="inline h-3 w-3 text-rose-400" /> di halaman detail untuk menyimpan
      </p>
      <a
        href={href}
        className="text-xs font-medium text-primary hover:underline underline-offset-2"
      >
        Jelajahi {label} →
      </a>
    </div>
  );
}