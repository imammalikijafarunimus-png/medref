import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers"; // Tambahkan ini
import "./globals.css";
import { Header } from "@/components/medical/header";
import { BottomNav } from "@/components/medical/bottom-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { Toaster } from "@/components/ui/sonner";
import { DynamicYear } from "@/components/DynamicYear";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "MedRef - Sistem Referensi Klinis",
    template: "%s | MedRef"
  },
  description: "Aplikasi referensi klinis untuk tenaga medis Indonesia. Database obat, herbal, dan pengetahuan klinis.",
  keywords: ["medis", "obat", "herbal", "klinis", "dokter", "perawat", "apoteker", "referensi", "PWA"],
  authors: [{ name: "MedRef Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MedRef",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "MedRef",
    title: "MedRef - Sistem Referensi Klinis",
    description: "Aplikasi referensi klinis untuk tenaga medis Indonesia",
  },
  twitter: {
    card: "summary",
    title: "MedRef - Sistem Referensi Klinis",
    description: "Aplikasi referensi klinis untuk tenaga medis Indonesia",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0ea5e9" },
    { media: "(prefers-color-scheme: dark)", color: "#0284c7" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Ambil nonce yang di-generate oleh middleware
  const headerList = await headers();
  const nonce = headerList.get("x-nonce") || "";

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/icon-512x512.png" type="image/png" />
        <link rel="icon" href="/icons/icon-192x192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icons/icon-512x512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      {/* Penting: Gunakan nonce pada body atau script jika ada inline script manual. 
          Next.js secara otomatis akan menyisipkan nonce ke script internalnya 
          jika terdeteksi di headers.
      */}
      <body 
        className={`${inter.variable} font-sans antialiased`} 
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          nonce={nonce} // Berikan nonce ke ThemeProvider agar inline style-nya tidak diblokir
        >
          <div className="relative min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container py-4 md:py-6 px-4 pb-20 md:pb-6">
              {children}
            </main>
            <footer className="hidden md:block border-t py-4 text-center text-sm text-muted-foreground">
              <p>© <DynamicYear /> MedRef - Sistem Referensi Klinis Personal</p>
            </footer>
            <BottomNav />
          </div>
          <PWAInstallPrompt />
          <Toaster position="top-center" richColors closeButton />
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}