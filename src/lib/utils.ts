import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format tanggal Indonesia
export function formatTanggal(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

// Format tanggal singkat
export function formatTanggalSingkat(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

// Truncate text
export function potongTeks(teks: string, panjang: number): string {
  if (teks.length <= panjang) return teks;
  return teks.slice(0, panjang) + '...';
}

// Kapitalisasi huruf pertama
export function kapitalDepan(teks: string): string {
  return teks.charAt(0).toUpperCase() + teks.slice(1);
}