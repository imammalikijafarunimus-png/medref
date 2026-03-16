import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/medical/header";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MedRef - Sistem Referensi Klinis",
  description: "Aplikasi referensi klinis untuk tenaga medis Indonesia. Database obat, herbal, dan pengetahuan klinis.",
  keywords: ["medis", "obat", "herbal", "klinis", "dokter", "perawat", "apoteker"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="relative min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 container py-6 px-4">
            {children}
          </main>
          <footer className="border-t py-4 text-center text-sm text-muted-foreground">
            <p>© 2024 MedRef - Sistem Referensi Klinis Personal</p>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}