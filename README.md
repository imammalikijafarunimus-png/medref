# MedRef - Sistem Referensi Klinis Personal

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)

Aplikasi web referensi klinis untuk tenaga medis Indonesia. MedRef menyediakan database obat, herbal, panduan gejala, kalkulator medis, dan nilai normal laboratorium dalam satu platform yang mudah diakses.

## ✨ Fitur Utama

### 📚 Database Lengkap
- **Database Obat** - Informasi lengkap obat termasuk dosis, indikasi, kontraindikasi, efek samping, dan interaksi
- **Obat Herbal** - Referensi herbal berbasis bukti ilmiah
- **Panduan Gejala** - Pencarian obat berdasarkan gejala klinis
- **Catatan Klinis** - Panduan referensi cepat untuk praktik klinik

### 🔍 Pencarian Cerdas
- Pencarian real-time dengan debounce (300ms)
- Dropdown hasil pencarian yang responsif
- Filter berdasarkan kategori (Obat, Herbal, Gejala, Catatan)
- Tag pencarian populer untuk akses cepat
- Tracking pencarian untuk analisis penggunaan
- Empty state yang informatif
- Pagination untuk navigasi data yang efisien

### 💊 Cek Interaksi Obat
- Deteksi interaksi obat-obat
- Informasi tingkat keparahan interaksi
- Rekomendasi penanganan

### 🧮 Kalkulator Medis
Kalkulator medis dengan UI premium dan arsitektur modular. Fitur:
- Auto-calculate (kalkulasi otomatis saat input berubah)
- Label unit yang jelas dan eksplisit
- Hasil yang menonjol dengan fungsi copy
- Tombol reset untuk mengosongkan input
- Tampilan responsif untuk mobile

| Kalkulator | Fungsi |
|------------|--------|
| Dosis Pediatrik | Hitung dosis berdasarkan berat badan dengan warning |
| BMI | Indeks Massa Tubuh dengan kategori |
| GFR (Cockcroft-Gault) | Laju Filtrasi Glomerulus dan staging CKD |
| Kalori (BMR/TDEE) | Kebutuhan kalori harian (Mifflin-St Jeor) |
| Berat Badan Ideal | Perhitungan IBW (Devine, Robinson, Miller) |
| BSA | Body Surface Area (Mosteller, Du Bois, Haycock) |
| Infus | Flow rate dan drip rate |
| MAC Anestesi | Minimum Alveolar Concentration dengan penyesuaian usia/suhu |
| Konversi Steroid | Ekuivalensi dosis steroid antar jenis |
| Dosis Warfarin | Panduan penyesuaian dosis berdasarkan INR |
| Elektrolit | Corrected sodium (glukosa/lipid/protein) dan Anion Gap |

### 🧪 Nilai Normal Laboratorium
- Darah lengkap (CBC)
- Fungsi ginjal
- Fungsi hati
- Elektrolit
- Profil lipid
- Fungsi tiroid
- Dan masih banyak lagi

### ⭐ Fitur Tambahan
- **Favorit** - Simpan item untuk akses cepat (obat dan herbal)
- **Share** - Bagikan informasi via Web Share API atau clipboard
- **Toast Notifications** - Notifikasi feedback untuk setiap aksi
- **Dark Mode** - Dukungan tema gelap/terang
- **Offline Ready** - Progressive Web App (PWA) untuk akses offline

## 🛠️ Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| Next.js 16 | Framework React dengan App Router |
| TypeScript | Type safety dan developer experience |
| Prisma | ORM untuk database PostgreSQL |
| PostgreSQL | Database relasional |
| Tailwind CSS | Styling utility-first |
| shadcn/ui | Komponen UI yang dapat dikustomisasi |
| Sonner | Toast notifications |
| Lucide Icons | Icon library |
| PWA | Progressive Web App |

## 📁 Struktur Proyek

```
medref/
├── prisma/
│   ├── schema.prisma           # Schema database
│   └── migrations/             # Database migrations
├── public/
│   └── icons/                  # PWA icons
├── src/
│   ├── app/
│   │   ├── api/                # API routes
│   │   │   ├── drugs/          # Drug API endpoints
│   │   │   ├── herbals/        # Herbal API endpoints
│   │   │   ├── symptoms/       # Symptom API endpoints
│   │   │   ├── notes/          # Notes API endpoints
│   │   │   ├── search/         # Search API endpoint
│   │   │   └── interaksi/      # Drug interaction API
│   │   ├── drugs/              # Halaman obat
│   │   ├── herbals/            # Halaman herbal
│   │   ├── symptoms/           # Halaman gejala
│   │   ├── notes/              # Halaman catatan
│   │   ├── favorites/          # Halaman favorit
│   │   ├── interaksi/          # Cek interaksi obat
│   │   ├── kalkulator/         # Kalkulator medis
│   │   ├── lab-values/         # Nilai normal lab
│   │   └── search/             # Halaman pencarian
│   ├── components/
│   │   ├── medical/            # Komponen medis
│   │   │   ├── calculators/    # Modul kalkulator medis
│   │   │   │   ├── calculator-page.tsx    # Halaman utama
│   │   │   │   ├── calculator-ui.tsx      # Komponen UI reusable
│   │   │   │   ├── calculations.ts        # Fungsi kalkulasi murni
│   │   │   │   ├── types.ts               # Type definitions
│   │   │   │   └── *-calculator.tsx       # Komponen kalkulator individual
│   │   │   ├── search-bar.tsx             # Komponen pencarian
│   │   │   ├── search-provider.tsx        # Context untuk pencarian
│   │   │   ├── search-results-dropdown.tsx # Dropdown hasil
│   │   │   ├── search-result-item.tsx     # Item hasil pencarian
│   │   │   ├── search-empty-state.tsx     # Empty state pencarian
│   │   │   └── popular-search-tags.tsx    # Tag populer
│   │   └── ui/                 # Komponen UI (shadcn)
│   ├── lib/
│   │   ├── data.ts             # Data fetching functions
│   │   ├── utils.ts            # Utility functions
│   │   ├── fuzzy-search.ts     # Fuzzy search implementation
│   │   └── actions/            # Server actions
│   └── services/               # Service layer
│       ├── drug-service.ts
│       ├── herbal-service.ts
│       ├── symptom-service.ts
│       └── search-service.ts
├── .env                        # Environment variables
├── manifest.json               # PWA manifest
└── sw.js                       # Service Worker
```

## 🧮 Arsitektur Kalkulator Medis

Modul kalkulator menggunakan arsitektur modular yang bersih:

```
calculators/
├── types.ts              # Type definitions (Gender, ActivityLevel, dll)
├── calculations.ts       # Pure calculation functions (no UI)
├── calculator-ui.tsx     # Reusable UI components
├── calculator-page.tsx   # Main page with navigation
└── *-calculator.tsx      # Individual calculator components
```

**Keuntungan Arsitektur Modular:**
- **Separation of Concerns** - Logika kalkulasi terpisah dari UI
- **Testability** - Fungsi kalkulasi murni mudah diuji
- **Reusability** - Komponen UI dapat digunakan ulang
- **Maintainability** - Mudah menambah kalkulator baru
- **Type Safety** - TypeScript untuk semua komponen

## 🚀 Instalasi

### Prasyarat
- Node.js 18+
- PostgreSQL database
- npm atau yarn

### Langkah Instalasi

1. **Clone repository**
```bash
git clone https://github.com/username/medref.git
cd medref
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Edit file `.env` dan sesuaikan dengan konfigurasi database Anda:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/medref"
```

4. **Generate Prisma Client dan migrasi database**
```bash
npx prisma generate
npx prisma db push
```

5. **Jalankan aplikasi**
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 📱 PWA Installation

MedRef adalah Progressive Web App yang dapat diinstal di perangkat:

1. Buka aplikasi di browser
2. Klik ikon "Install" di address bar atau menu browser
3. Aplikasi akan terinstall dan dapat diakses offline

## 🔧 Scripts

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build untuk production |
| `npm run start` | Jalankan production server |
| `npm run lint` | Jalankan ESLint |
| `npx prisma studio` | Buka Prisma Studio GUI |
| `npx prisma generate` | Generate Prisma Client |

## 🤝 Contributing

Kontribusi sangat diterima! Silakan buat issue atau pull request.

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/fitur-baru`)
3. Commit perubahan (`git commit -m 'Tambah fitur baru'`)
4. Push ke branch (`git push origin feature/fitur-baru`)
5. Buat Pull Request

## 📝 Changelog

### Version 1.1.0 (Current)
- ✨ Refactor kalkulator medis dengan UI premium
- ✨ Tambah pencarian dropdown real-time
- ✨ Tambah tag pencarian populer
- ✨ Tambah search tracking untuk analisis
- 🎨 Perbaikan UI/UX halaman utama
- 🐛 Perbaikan berbagai bug minor

### Version 1.0.0
- 🎉 Rilis awal
- 📚 Database obat, herbal, gejala, catatan
- 🧮 Kalkulator medis dasar
- 💊 Cek interaksi obat
- ⭐ Fitur favorit

## 📄 License

MIT License - Lihat file [LICENSE](LICENSE) untuk detail.

## 👨‍💻 Author

MedRef Team

---

**MedRef** - Referensi Klinis di Ujung Jari Anda