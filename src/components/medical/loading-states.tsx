import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Skeleton untuk kartu obat — matches DrugCard structure
export function DrugCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden animate-pulse">
      <div className="p-3 sm:p-4 flex flex-col gap-2.5">
        {/* Row 1: Icon + Name + Actions */}
        <div className="flex items-start gap-3">
          <Skeleton className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </div>
        
        {/* Row 2: Category badge */}
        <Skeleton className="h-5 w-20 rounded-full" />
        
        {/* Row 3: Description */}
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        
        {/* Row 4: Indications */}
        <div className="flex gap-1">
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
      </div>
    </div>
  );
}

// Skeleton untuk daftar obat
export function DrugListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <DrugCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton untuk detail obat
export function DrugDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-xl" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-32 mt-2" />
        </div>
      </div>
      <Skeleton className="h-6 w-24" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

// Skeleton untuk kartu herbal — matches HerbalCard structure
export function HerbalCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden animate-pulse">
      {/* Safety stripe placeholder */}
      <Skeleton className="h-0.5 w-full rounded-none" />
      
      <div className="p-3 sm:p-4 flex flex-col gap-2.5">
        {/* Row 1: Icon + Name + Actions */}
        <div className="flex items-start gap-3">
          <Skeleton className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </div>
        
        {/* Row 2: Badges */}
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>
        
        {/* Row 3: Stats */}
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
        
        {/* Row 4: Indications */}
        <div className="pt-2 border-t border-border/50 space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 flex-1 rounded" />
            <Skeleton className="h-3 w-12 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 flex-1 rounded" />
            <Skeleton className="h-3 w-14 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton untuk daftar herbal
export function HerbalListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <HerbalCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton untuk kartu catatan
export function NoteCardSkeleton() {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg bg-purple-100" />
          <div>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24 mt-1" />
          </div>
        </div>
        <Skeleton className="h-4 w-4" />
      </div>
      <Skeleton className="h-6 w-24 mt-3" />
      <div className="mt-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3 mt-1" />
      </div>
    </div>
  );
}

// Page loader full screen
export function PageLoader({ message = 'Memuat...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">{message}</p>
    </div>
  );
}

// Inline loader
export function InlineLoader({ className }: { className?: string }) {
  return (
    <Loader2 className={cn('h-4 w-4 animate-spin', className)} />
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted/50 p-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-3 flex gap-4 border-t">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}