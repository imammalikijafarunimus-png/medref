import type { NextConfig } from 'next'

const isProduction = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  // 1. React Compiler (Next.js 15+)
  reactCompiler: true,

  // 2. Pindahkan typedRoutes dari 'experimental' ke root (Next.js 15+)
  // Set ke false sesuai kebutuhan build Anda yang sukses tadi
  typedRoutes: false,

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
          },
          ...(isProduction
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains; preload',
                },
              ]
            : []),
        ],
      },
      // API routes - no caching (Penting untuk data medis MedRef yang dinamis)
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      // Static assets - long cache
      {
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(manifest.json|sw.js)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ]
  },

  async redirects() {
    return [
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      },
    ]
  },

  // 3. Image optimization - Batasi hostname jika memungkinkan demi keamanan
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Contoh: Batasi hanya ke storage Supabase Anda
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com', // Untuk foto profil user
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  logging: {
    fetches: {
      fullUrl: !isProduction, // Biasanya lebih berguna melihat full URL saat development
    },
  },

  // 4. Tambahan: Optimasi Output (Opsional)
  // Membantu deployment di platform seperti Vercel atau VPS
  poweredByHeader: false, // Menghilangkan header X-Powered-By demi keamanan
}

export default nextConfig