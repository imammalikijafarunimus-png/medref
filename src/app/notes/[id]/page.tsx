import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  FileText, 
  Calendar,
  Tag,
  User,
  Heart,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTanggalSingkat } from '@/lib/utils';

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

async function getNote(id: string) {
  const note = await db.clinicalNote.findUnique({
    where: { id },
  });

  return note;
}

// Simple markdown-like content renderer
function renderContent(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    // Headers
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={index} className="text-base font-semibold mt-4 mb-2">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={index} className="text-lg font-semibold mt-6 mb-3">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h1 key={index} className="text-xl font-bold mt-6 mb-3">
          {line.slice(2)}
        </h1>
      );
    }
    // Bullet points
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={index} className="ml-4 text-sm list-disc">
          {line.slice(2)}
        </li>
      );
    }
    // Numbered list
    else if (/^\d+\. /.test(line)) {
      const match = line.match(/^(\d+)\. (.*)$/);
      if (match) {
        elements.push(
          <li key={index} className="ml-4 text-sm list-decimal">
            {match[2]}
          </li>
        );
      }
    }
    // Empty line
    else if (line.trim() === '') {
      elements.push(<div key={index} className="h-2" />);
    }
    // Bold text
    else if (line.includes('**')) {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      elements.push(
        <p key={index} className="text-sm">
          {parts.map((part, i) =>
            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
          )}
        </p>
      );
    }
    // Regular paragraph
    else {
      elements.push(
        <p key={index} className="text-sm">
          {line}
        </p>
      );
    }
  });

  return elements;
}

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const note = await getNote(id);

  if (!note) {
    notFound();
  }

  const categoryColor = note.category 
    ? warnaKategori[note.category.toLowerCase()] || 'bg-gray-100 text-gray-700'
    : null;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href="/notes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Kembali ke Catatan Klinis</span>
        <span className="sm:hidden">Kembali</span>
      </Link>

      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="p-2.5 sm:p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 shrink-0">
          <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-xl sm:text-2xl font-bold">{note.title}</h1>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {note.specialty && (
            <p className="text-muted-foreground mt-1">{note.specialty}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {categoryColor && (
              <Badge className={cn('capitalize', categoryColor)}>
                {note.category}
              </Badge>
            )}
            {note.version > 1 && (
              <Badge variant="outline" className="text-xs">
                v{note.version}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>Update: {formatTanggalSingkat(note.updatedAt)}</span>
        </div>
        {note.author && (
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            <span>{note.author}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {note.tags && (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-1.5">
            {note.tags.split(',').map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag.trim()}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {renderContent(note.content)}
          </div>
        </CardContent>
      </Card>

      {/* Source */}
      {note.source && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Sumber:</span> {note.source}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}