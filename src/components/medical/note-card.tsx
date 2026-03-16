import Link from 'next/link';
import { FileText, ChevronRight, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatTanggalSingkat } from '@/lib/utils';
import type { ClinicalNote } from '@/types';

interface NoteCardProps {
  note: ClinicalNote;
}

// Warna kategori
const warnaKategori: Record<string, string> = {
  kardiologi: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  neurologi: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  pediatri: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  obstetri: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  dermatologi: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  gastroenterologi: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  pulmonologi: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  urologi: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  psikiatri: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  igd: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  umum: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

export function NoteCard({ note }: NoteCardProps) {
  // Preview konten (hapus markdown formatting)
  const previewKonten = note.content
    .replace(/[#*`_\[\]]/g, '')
    .slice(0, 120)
    .trim();

  return (
    <Link 
      href={`/notes/${note.id}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
    >
      <Card className="transition-all duration-200 hover:shadow-md active:scale-[0.98] hover:border-primary/20 cursor-pointer h-full">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="p-2 sm:p-2.5 rounded-lg bg-violet-50 dark:bg-violet-950/30 flex-shrink-0">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base truncate">{note.title}</h3>
                {note.specialty && (
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {note.specialty}
                  </p>
                )}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/30 flex-shrink-0" />
          </div>

          <Badge 
            variant="secondary" 
            className={cn(
              'mt-2.5 sm:mt-3 text-[10px] sm:text-xs capitalize',
              warnaKategori[note.category?.toLowerCase()] || 'bg-gray-100 text-gray-700'
            )}
          >
            {note.category}
          </Badge>

          {/* Preview konten */}
          <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-muted-foreground line-clamp-2">
            {previewKonten}...
          </p>

          {/* Tanggal update */}
          <div className="flex items-center gap-1 mt-2.5 sm:mt-3 text-[10px] sm:text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Update: {formatTanggalSingkat(new Date(note.updatedAt))}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}