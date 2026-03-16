'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Pill, 
  Leaf, 
  FileText, 
  Activity, 
  Heart,
  Calculator,
  AlertTriangle,
  Home,
  Search
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { SearchBar } from '@/components/medical/search-bar';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/', label: 'Beranda', icon: Home },
  { href: '/drugs', label: 'Obat', icon: Pill },
  { href: '/herbals', label: 'Herbal', icon: Leaf },
  { href: '/symptoms', label: 'Gejala', icon: Activity },
  { href: '/notes', label: 'Catatan', icon: FileText },
  { href: '/kalkulator', label: 'Kalkulator', icon: Calculator },
  { href: '/interaksi', label: 'Interaksi', icon: AlertTriangle },
  { href: '/favorites', label: 'Favorit', icon: Heart },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Pill className="h-5 w-5 text-primary" />
          </div>
          <span className="hidden sm:inline">MedRef</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center px-4">
          {menuItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          {/* Desktop Search */}
          <div className="hidden md:block relative w-64">
            <SearchBar 
              placeholder="Cari obat, herbal..." 
              className="w-full"
            />
          </div>

          {/* Mobile Search Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 md:hidden"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Buka pencarian"
          >
            <Search className="h-4 w-4" />
          </Button>

          <ThemeToggle />

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {searchOpen && (
        <div className="md:hidden border-t px-4 py-3">
          <SearchBar 
            placeholder="Cari obat, herbal, gejala..."
            className="w-full"
            autoFocus
          />
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container px-4 py-2 grid grid-cols-2 gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-md transition-colors',
                    isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}