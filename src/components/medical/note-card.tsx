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
  kardiologi: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  neurologi: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  pediatri: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  obstetri: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  dermatologi: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  gastroenterologi: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  pulmonologi: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  urologi: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  psikiatri: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  igd: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  umum: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

export function NoteCard({ note }: NoteCardProps) {
  // Preview konten (hapus markdown formatting)
  const previewKonten = note.content
    .replace(/[#*`_\[\]]/g, '')
    .slice(0, 150)
    .trim();

  return (
    <Link href={`/notes/${note.id}`}>
      <Card className="transition-all duration-200 hover:shadow-md hover:border-primary/20 cursor-pointer h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex-shrink-0">
                <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{note.title}</h3>
                {note.specialty && (
                  <p className="text-sm text-muted-foreground truncate">
                    {note.specialty}
                  </p>
                )}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
          </div>

          <Badge 
            variant="secondary" 
            className={cn(
              'mt-3 text-xs capitalize',
              warnaKategori[note.category?.toLowerCase()] || 'bg-gray-100 text-gray-700'
            )}
          >
            {note.category}
          </Badge>

          {/* Preview konten */}
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
            {previewKonten}...
          </p>

          {/* Tanggal update */}
          <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Update: {formatTanggalSingkat(new Date(note.updatedAt))}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}