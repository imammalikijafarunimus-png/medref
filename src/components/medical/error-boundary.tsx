'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
          <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="font-semibold text-lg">Terjadi Kesalahan</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            {this.state.error?.message || 'Terjadi kesalahan yang tidak terduga'}
          </p>
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Muat Ulang
            </Button>
            <Button asChild>
              <a href="/">
                <Home className="h-4 w-4 mr-2" />
                Ke Beranda
              </a>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// API Error component
export function ApiError({ 
  message = 'Gagal memuat data',
  onRetry 
}: { 
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[200px]">
      <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="font-semibold">Gagal Memuat Data</h3>
      <p className="text-muted-foreground mt-1">{message}</p>
      {onRetry && (
        <Button 
          variant="outline"
          className="mt-4"
          onClick={onRetry}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Coba Lagi
        </Button>
      )}
    </div>
  );
}

// Not Found component
export function NotFound({ 
  item = 'Item',
  message,
  action
}: { 
  item?: string;
  message?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
      <div className="text-6xl font-bold text-muted-foreground/30 mb-4">404</div>
      <h3 className="font-semibold text-lg">{item} Tidak Ditemukan</h3>
      <p className="text-muted-foreground mt-1">
        {message || `${item} yang Anda cari tidak tersedia atau telah dihapus.`}
      </p>
      {action && (
        <Button className="mt-4" asChild>
          <a href={action.href}>{action.label}</a>
        </Button>
      )}
    </div>
  );
}

// Rate Limit Error component
export function RateLimitError({ retryAfter }: { retryAfter?: number }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[200px]">
      <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
        <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
      </div>
      <h3 className="font-semibold">Terlalu Banyak Permintaan</h3>
      <p className="text-muted-foreground mt-1">
        Mohon tunggu beberapa saat sebelum mencoba lagi.
        {retryAfter && ` Coba lagi dalam ${retryAfter} detik.`}
      </p>
    </div>
  );
}