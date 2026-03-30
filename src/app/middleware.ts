// =============================================
// Security Middleware (Optimized for Next.js 15+)
// =============================================

import { NextRequest, NextResponse } from 'next/server'

// Generate a random nonce for CSP
function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Buffer.from(array).toString('base64')
}

export function middleware(request: NextRequest) {
  const nonce = generateNonce()
  
  // 1. Clone request headers agar Server Components bisa membaca nonce (via headers())
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  // 2. Buat response object dengan request headers yang sudah disisipkan nonce
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // 3. Setup Content Security Policy (CSP)
  const isDev = process.env.NODE_ENV === 'development'
  
  // Hanya gunakan unsafe-eval di development untuk mendukung hot-reloading Next.js
  const scriptSrc = isDev 
    ? `script-src 'self' 'nonce-${nonce}' 'unsafe-eval' 'strict-dynamic'`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`

  const cspHeader = [
    "default-src 'self'",
    scriptSrc,
    // Menghapus nonce dari style-src sangat penting untuk Tailwind CSS
    // karena 'unsafe-inline' akan diabaikan browser jika ada nonce.
    "style-src 'self' 'unsafe-inline'", 
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    // Membuka koneksi untuk analitik dan ekosistem database/backend eksternal
    "connect-src 'self' https://api.sentry.io https://*.firebaseio.com https://*.googleapis.com", 
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ')

  response.headers.set('Content-Security-Policy', cspHeader)
  
  // 4. Custom Headers untuk Tracking & Debugging
  response.headers.set('x-nonce', nonce)
  response.headers.set('x-request-id', crypto.randomUUID())
  response.headers.set('x-security-version', '2.1') // Penanda bahwa ini versi terbaru

  /*
   * Catatan: Header keamanan statis (X-Frame-Options, X-Content-Type-Options, dll) 
   * dan Cache-Control untuk rute /api/ telah dihapus dari sini karena sudah 
   * ditangani secara lebih efisien di dalam next.config.ts Anda.
   */

  return response
}

// Konfigurasi path mana saja yang akan dieksekusi oleh middleware ini
export const config = {
  matcher: [
    {
      // Mengecualikan aset statis, API routes (opsional), dan file sistem agar lebih ringan
      source: '/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}