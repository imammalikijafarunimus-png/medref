// src/components/medical/empty-states.tsx
import React from 'react'
import Link from 'next/link'
import {
  Package,
  Search,
  Leaf,
  FileText,
  Heart,
  Activity,
  Clock,
} from 'lucide-react'

// --- Types ---

interface Action {
  label: string
  onClick?: () => void
  href?: string
}

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  className?: string
  action?: Action
}

// --- Base Component ---

export function EmptyState({
  icon: Icon,
  title,
  description,
  className = '',
  action,
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// --- Variants ---

export function NoSearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon={Search}
      title="Tidak Ada Hasil"
      description={`Tidak ditemukan hasil untuk "${query}". Coba kata kunci lain.`}
    />
  )
}

export function EmptyDrugs() {
  return (
    <EmptyState
      icon={Package}
      title="Belum Ada Obat"
      description="Mulai tambahkan data obat ke dalam sistem."
    />
  )
}

export function EmptyHerbals() {
  return (
    <EmptyState
      icon={Leaf}
      title="Belum Ada Herbal"
      description="Mulai tambahkan data herbal ke dalam sistem."
    />
  )
}

export function EmptyNotes() {
  return (
    <EmptyState
      icon={FileText}
      title="Belum Ada Catatan"
      description="Buat catatan pribadi atau profesional di sini."
    />
  )
}

export function EmptyFavorites() {
  return (
    <EmptyState
      icon={Heart}
      title="Belum Ada Favorit"
      description="Simpan obat atau artikel favorit Anda di sini."
    />
  )
}

export function EmptySymptoms() {
  return (
    <EmptyState
      icon={Activity}
      title="Belum Ada Gejala"
      description="Tidak ada riwayat gejala yang tercatat."
    />
  )
}

export function ComingSoon({ feature }: { feature: string }) {
  return (
    <EmptyState
      icon={Clock}
      title="Segera Hadir"
      description={`Fitur ${feature} sedang dalam pengembangan.`}
    />
  )
}