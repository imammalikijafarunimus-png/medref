'use client';

import { memo } from 'react';
import { FileText, Trash2, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { FavoriteNote } from './types';

interface FavoriteNoteCardProps {
  note: FavoriteNote;
  onRemove: (noteId: string) => void;
  onClick: (noteId: string) => void;
  isRemoving?: boolean;
}

export const FavoriteNoteCard = memo(function FavoriteNoteCard({
  note,
  onRemove,
  onClick,
  isRemoving = false,
}: FavoriteNoteCardProps) {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(note.id);
  };

  // Truncate content for preview
  const contentPreview = note.content
    .replace(/[#*`_~]/g, '') // Remove markdown formatting
    .slice(0, 100)
    .trim();

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-200',
        'hover:shadow-md hover:border-amber-500/20 cursor-pointer',
        'bg-card border-border/50',
        isRemoving && 'opacity-50 pointer-events-none'
      )}
      onClick={() => onClick(note.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-card-foreground truncate">
                  {note.title}
                </h3>
                {note.specialty && (
                  <p className="text-sm text-muted-foreground truncate">
                    {note.specialty}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleRemove}
                  disabled={isRemoving}
                  aria-label="Hapus dari favorit"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Content Preview */}
            {contentPreview && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {contentPreview}...
              </p>
            )}

            {/* Badges */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {note.category && (
                <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20">
                  {note.category}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});