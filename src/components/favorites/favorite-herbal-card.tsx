'use client';

import { memo } from 'react';
import { Leaf, Trash2, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { FavoriteHerbal } from './types';

interface FavoriteHerbalCardProps {
  herbal: FavoriteHerbal;
  onRemove: (herbalId: string) => void;
  onClick: (herbalId: string) => void;
  isRemoving?: boolean;
}

export const FavoriteHerbalCard = memo(function FavoriteHerbalCard({
  herbal,
  onRemove,
  onClick,
  isRemoving = false,
}: FavoriteHerbalCardProps) {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(herbal.id);
  };

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-200',
        'hover:shadow-md hover:border-green-500/20 cursor-pointer',
        'bg-card border-border/50',
        isRemoving && 'opacity-50 pointer-events-none'
      )}
      onClick={() => onClick(herbal.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-card-foreground truncate">
                  {herbal.name}
                </h3>
                {herbal.latinName && (
                  <p className="text-sm text-muted-foreground italic truncate">
                    {herbal.latinName}
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

            {/* Benefit Preview */}
            {herbal.benefit && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {herbal.benefit}
              </p>
            )}

            {/* Badges */}
            {herbal.category && (
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20">
                  {herbal.category}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});