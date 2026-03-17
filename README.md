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
- Pencarian real-time dengan debounce
- Filter berdasarkan kategori
- Pagination untuk navigasi data yang efisien

### 💊 Cek Interaksi Obat
- Deteksi interaksi obat-obat
- Informasi tingkat keparahan interaksi
- Rekomendasi penanganan

### 🧮 Kalkulator Medis
Lengkap dengan 11+ kalkulator medis:

| Kalkulator | Fungsi |
|------------|--------|
| Dosis Pediatrik | Hitung dosis berdasarkan berat badan |
| BMI | Indeks Massa Tubuh |
| GFR (Cockcroft-Gault) | Laju Filtrasi Glomerulus |
| Kalori (BMR/TDEE) | Kebutuhan kalori harian |
| Berat Badan Ideal | Perhitungan IBW dan BB Ideal |
| BSA (Du Bois) | Body Surface Area |
| Infus | Flow rate dan drip rate |
| MAC Anestesi | Minimum Alveolar Concentration |
| Konversi Steroid | Ekuivalensi dosis steroid |
| Dosis Warfarin | Panduan dosing antikoagulan |
| Elektrolit | Corrected sodium, anion gap |

### 🧪 Nilai Normal Laboratorium
- Darah lengkap (CBC)
- Fungsi ginjal
- Fungsi hati
- Elektrolit
- Profil lipid
- Fungsi tiroid
- Dan masih banyak lagi

### ⭐ Fitur Tambahan
- **Favorit** - Simpan item untuk akses cepat
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
│   └── schema.prisma        # Schema database
├── public/
│   └── icons/               # PWA icons
├── src/
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── drugs/           # Halaman obat
│   │   ├── herbals/         # Halaman herbal
│   │   ├── symptoms/        # Halaman gejala
│   │   ├── notes/           # Halaman catatan
│   │   ├── favorites/       # Halaman favorit
│   │   ├── interaksi/       # Cek interaksi obat
│   │   ├── kalkulator/      # Kalkulator medis
│   │   ├── lab-values/      # Nilai normal lab
│   │   └── search/          # Halaman pencarian
│   ├── components/
│   │   ├── medical/         # Komponen medis
│   │   └── ui/              # Komponen UI (shadcn)
│   └── lib/
│       ├── data.ts          # Data fetching functions
│       └── utils.ts         # Utility functions
├── .env                     # Environment variables
├── manifest.json            # PWA manifest
└── sw.js                    # Service Worker
```

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

## 🤝 Contributing

Kontribusi sangat diterima! Silakan buat issue atau pull request.

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/fitur-baru`)
3. Commit perubahan (`git commit -m 'Tambah fitur baru'`)
4. Push ke branch (`git push origin feature/fitur-baru`)
5. Buat Pull Request

## 📄 License

MIT License - Lihat file [LICENSE](LICENSE) untuk detail.

## 👨‍💻 Author

MedRef Team

---

**MedRef** - Referensi Klinis di Ujung Jari Anda