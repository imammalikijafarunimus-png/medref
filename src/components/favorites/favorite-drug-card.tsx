'use client';

import { memo } from 'react';
import { Pill, Trash2, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { FavoriteDrug } from './types';

interface FavoriteDrugCardProps {
  drug: FavoriteDrug;
  onRemove: (drugId: string) => void;
  onClick: (drugId: string) => void;
  isRemoving?: boolean;
}

export const FavoriteDrugCard = memo(function FavoriteDrugCard({
  drug,
  onRemove,
  onClick,
  isRemoving = false,
}: FavoriteDrugCardProps) {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(drug.id);
  };

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-200',
        'hover:shadow-md hover:border-primary/20 cursor-pointer',
        'bg-card border-border/50',
        isRemoving && 'opacity-50 pointer-events-none'
      )}
      onClick={() => onClick(drug.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Pill className="w-5 h-5 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-card-foreground truncate">
                  {drug.name}
                </h3>
                {drug.genericName && (
                  <p className="text-sm text-muted-foreground truncate">
                    {drug.genericName}
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

            {/* Badges */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {drug.category && (
                <Badge variant="secondary" className="text-xs">
                  {drug.category}
                </Badge>
              )}
              {drug.drugClass && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  {drug.drugClass}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});