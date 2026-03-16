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
  aman: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'hati-hati': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'tidak aman': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  safe: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  caution: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  unsafe: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

export function HerbalCard({ herbal }: HerbalCardProps) {
  return (
    <Link 
      href={`/herbals/${herbal.id}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
    >
      <Card className="transition-all duration-200 hover:shadow-md active:scale-[0.98] hover:border-primary/20 cursor-pointer h-full">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex-shrink-0">
                <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base truncate">{herbal.name}</h3>
                {herbal.latinName && (
                  <p className="text-xs sm:text-sm text-muted-foreground italic truncate">
                    {herbal.latinName}
                  </p>
                )}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/30 flex-shrink-0" />
          </div>

          {herbal.safetyRating && (
            <Badge 
              variant="secondary" 
              className={cn(
                'mt-2.5 sm:mt-3 text-[10px] sm:text-xs capitalize',
                warnaKeamanan[herbal.safetyRating.toLowerCase()] || 'bg-gray-100 text-gray-700'
              )}
            >
              {herbal.safetyRating}
            </Badge>
          )}

          {/* Indikasi utama */}
          {herbal.indications && herbal.indications.length > 0 && (
            <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-border/50">
              <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                {herbal.indications.slice(0, 3).map(i => typeof i === 'string' ? i : i.indication).join(', ')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}