import { Search, Pill, Leaf, FileText, Heart, Activity, Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center p-8 min-h-[300px]',
      className
    )}>
      <div className="p-4 rounded-full bg-muted/50 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-muted-foreground mt-1 max-w-sm">{description}</p>
      {action && (
        <Button 
          className="mt-4"
          onClick={action.onClick}
          {...(action.href ? { asChild: true } : {})}
        >
          {action.href ? (
            <a href={action.href}>{action.label}</a>
          ) : (
            action.label
          )}
        </Button>
      )}
    </div>
  );
}

// Tidak ada hasil pencarian
export function NoSearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon={Search}
      title="Tidak Ada Hasil"
      description={`Tidak ditemukan hasil untuk "${query}". Coba kata kunci lain atau periksa ejaan.`}
    />
  );
}

// Tidak ada obat
export function EmptyDrugs() {
  return (
    <EmptyState
      icon={Pill}
      title="Belum Ada Obat"
      description="Database obat masih kosong. Tambahkan obat pertama untuk memulai."
    />
  );
}

// Tidak ada herbal
export function EmptyHerbals() {
  return (
    <EmptyState
      icon={Leaf}
      title="Belum Ada Herbal"
      description="Database herbal masih kosong. Tambahkan herbal pertama untuk memulai."
    />
  );
}

// Tidak ada catatan
export function EmptyNotes() {
  return (
    <EmptyState
      icon={FileText}
      title="Belum Ada Catatan"
      description="Belum ada catatan klinis. Buat catatan pertama untuk memulai."
    />
  );
}

// Tidak ada favorit
export function EmptyFavorites() {
  return (
    <EmptyState
      icon={Heart}
      title="Belum Ada Favorit"
      description="Anda belum menyimpan item favorit. Klik ikon hati untuk menyimpan."
    />
  );
}

// Tidak ada gejala
export function EmptySymptoms() {
  return (
    <EmptyState
      icon={Activity}
      title="Belum Ada Gejala"
      description="Database gejala masih kosong. Tambahkan gejala untuk memulai."
    />
  );
}

// Coming soon
export function ComingSoon({ feature }: { feature: string }) {
  return (
    <EmptyState
      icon={Construction}
      title="Segera Hadir"
      description={`Fitur ${feature} sedang dalam pengembangan dan akan segera tersedia.`}
    />
  );
}