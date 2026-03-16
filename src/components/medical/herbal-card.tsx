import Link from 'next/link';
import { Leaf, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Herbal } from '@/types';

interface HerbalCardProps {
  herbal: Herbal;
}

// Warna rating keamanan
const warnaKeamanan: Record<string, string> = {
  aman: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'hati-hati': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'tidak aman': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  safe: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  caution: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  unsafe: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export function HerbalCard({ herbal }: HerbalCardProps) {
  return (
    <Link href={`/herbals/${herbal.id}`}>
      <Card className="transition-all duration-200 hover:shadow-md hover:border-primary/20 cursor-pointer h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30 flex-shrink-0">
                <Leaf className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{herbal.name}</h3>
                {herbal.latinName && (
                  <p className="text-sm text-muted-foreground italic truncate">
                    {herbal.latinName}
                  </p>
                )}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
          </div>

          {herbal.safetyRating && (
            <Badge 
              variant="secondary" 
              className={cn(
                'mt-3 text-xs capitalize',
                warnaKeamanan[herbal.safetyRating.toLowerCase()] || 'bg-gray-100 text-gray-700'
              )}
            >
              {herbal.safetyRating}
            </Badge>
          )}

          {/* Indikasi utama */}
          {herbal.indications && herbal.indications.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {herbal.indications.slice(0, 3).map(i => typeof i === 'string' ? i : i.indication).join(', ')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}