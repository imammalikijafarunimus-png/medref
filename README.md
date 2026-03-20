# MedRef - Sistem Referensi Klinis Indonesia

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)
![Test Coverage](https://img.shields.io/badge/Tests-342%20passing-success)
![License](https://img.shields.io/badge/License-MIT%20%2B%20Medical%20Disclaimer-green)

Aplikasi web referensi klinis enterprise-grade untuk tenaga medis Indonesia. MedRef menyediakan database obat, herbal, panduan gejala, kalkulator medis, dan nilai normal laboratorium dalam satu platform yang aman dan mudah diakses.

## 📑 Table of Contents

- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Instalasi](#-instalasi)
- [Testing](#-testing)
- [CI/CD](#-cicd)
- [Dokumentasi](#-dokumentasi)
- [Keamanan](#-keamanan)
- [Struktur Proyek](#-struktur-proyek)
- [Scripts](#-scripts)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Fitur Utama

### 📚 Database Lengkap
| Fitur | Deskripsi |
|-------|-----------|
| 💊 **Database Obat** | Informasi lengkap obat termasuk dosis, indikasi, kontraindikasi, efek samping, dan interaksi |
| 🌿 **Obat Herbal** | Referensi herbal berbasis bukti ilmiah dengan rating keamanan |
| 📋 **Panduan Gejala** | Pencarian obat berdasarkan gejala klinis |
| 📝 **Catatan Klinis** | Panduan referensi cepat untuk praktik klinik |
| 🧪 **Nilai Normal Lab** | 60+ nilai normal laboratorium terorganisir per kategori |

### 🔍 Pencarian Cerdas
- Pencarian real-time dengan fuzzy matching
- Dropdown hasil pencarian responsif
- Filter berdasarkan kategori
- Tag pencarian populer
- Tracking untuk analisis penggunaan

### 💊 Cek Interaksi Obat
- Deteksi interaksi obat-obat
- Tingkat keparahan: Mayor, Moderat, Minor
- Mekanisme interaksi
- Rekomendasi penanganan

### 🧮 Kalkulator Medis (11 Kalkulator)
| Kalkulator | Fungsi |
|------------|--------|
| Dosis Pediatrik | Hitung dosis berdasarkan berat badan |
| BMI | Indeks Massa Tubuh dengan kategori |
| GFR | Laju Filtrasi Glomerulus dan staging CKD |
| Kalori | BMR/TDEE (Mifflin-St Jeor) |
| Berat Badan Ideal | IBW (Devine, Robinson, Miller) |
| BSA | Body Surface Area |
| Infus | Flow rate dan drip rate |
| MAC Anestesi | Minimum Alveolar Concentration |
| Konversi Steroid | Ekuivalensi dosis steroid |
| Dosis Warfarin | Panduan berdasarkan INR |
| Elektrolit | Corrected sodium & Anion Gap |

### 🔐 Keamanan Enterprise
- **Authentication**: NextAuth.js dengan multiple providers
- **RBAC**: Role-Based Access Control (6 roles)
- **Audit Logging**: Tracking semua aksi sensitif
- **Security Headers**: CSP, HSTS, X-Frame-Options
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Zod schema validation

### ⭐ Fitur Tambahan
- **Favorit** - Simpan item untuk akses cepat
- **Share** - Bagikan via Web Share API
- **Toast Notifications** - Feedback untuk setiap aksi
- **Dark Mode** - Tema gelap/terang
- **PWA** - Install sebagai aplikasi, akses offline

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 + Tailwind CSS 4 |
| Components | shadcn/ui |
| Database | PostgreSQL 15+ |
| ORM | Prisma 7 |
| Auth | NextAuth.js 4 |
| Testing | Vitest + Playwright |
| CI/CD | GitHub Actions |
| Deployment | Vercel |

---

## 🚀 Instalasi

### Prasyarat
- Node.js 20+
- PostgreSQL 15+
- npm atau yarn

### Langkah Instalasi

```bash
# 1. Clone repository
git clone https://github.com/medref/medref.git
cd medref

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local

# 4. Edit .env.local
# DATABASE_URL="postgresql://user:password@localhost:5432/medref"
# NEXTAUTH_SECRET="your-secret-key"
# NEXTAUTH_URL="http://localhost:3000"

# 5. Setup database
npx prisma generate
npx prisma db push
npm run db:seed

# 6. Jalankan aplikasi
npm run dev
```

Aplikasi berjalan di `http://localhost:3000`

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | Secret for JWT (min 32 chars) |
| `NEXTAUTH_URL` | ✅ | Base URL of your application |
| `GOOGLE_CLIENT_ID` | ❌ | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ❌ | Google OAuth secret |
| `GITHUB_CLIENT_ID` | ❌ | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | ❌ | GitHub OAuth secret |

---

## 🧪 Testing

### Test Statistics
- **Total Tests**: 342 passing
- **Test Files**: 10
- **E2E Suites**: 5
- **Coverage**: Actively improving toward 80%

### Unit Tests

```bash
# Run tests
npm run test

# Run once
npm run test:run

# With coverage
npm run test:coverage

# Interactive UI
npm run test:ui
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# With UI
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

### Run All Tests

```bash
npm run test:all
```

---

## 🔄 CI/CD

### GitHub Actions Pipeline

| Job | Trigger | Description |
|-----|---------|-------------|
| `lint` | All pushes | ESLint + TypeScript check |
| `test` | All pushes | Unit tests with PostgreSQL |
| `e2e` | Pull requests | Playwright E2E tests |
| `security` | All pushes | npm audit + Snyk scan |
| `build` | All pushes | Production build test |
| `preview` | Pull requests | Deploy to Vercel preview |
| `deploy` | main branch | Deploy to production |

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `SNYK_TOKEN` | Snyk API token (optional) |

---

## 📚 Dokumentasi

| Dokumen | Lokasi | Deskripsi |
|---------|--------|-----------|
| API Documentation | `/docs/api-documentation.md` | REST API endpoints |
| User Guide | `/docs/user-guide.md` | Panduan pengguna |
| Developer Docs | `/docs/developer-documentation.md` | Panduan developer |
| Deployment Guide | `/docs/deployment-guide.md` | Panduan deployment |

---

## 🔒 Keamanan

### Role-Based Access Control

| Role | Read | Write | Delete | Admin |
|------|------|-------|--------|-------|
| ADMIN | ✅ | ✅ | ✅ | ✅ |
| DOCTOR | ✅ | ✅ | ❌ | ❌ |
| PHARMACIST | ✅ | ✅ (drugs, herbals) | ❌ | ❌ |
| NURSE | ✅ | ❌ | ❌ | ❌ |
| STUDENT | ✅ (limited) | ❌ | ❌ | ❌ |
| GUEST | ✅ (drugs, herbals) | ❌ | ❌ | ❌ |

### Security Features
- Password hashing with bcrypt (12 rounds)
- Rate limiting on API endpoints
- Audit logging for sensitive actions
- Security headers (CSP, HSTS, X-Frame-Options)
- Input validation with Zod schemas

---

## 📁 Struktur Proyek

```
medref/
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Migration files
│   └── seed/                   # Seed data
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── drugs/             # Drug pages
│   │   ├── herbals/           # Herbal pages
│   │   ├── kalkulator/        # Calculator pages
│   │   └── ...
│   ├── components/
│   │   ├── ui/                # Base UI (shadcn)
│   │   ├── medical/           # Domain components
│   │   └── favorites/         # Favorite components
│   ├── lib/
│   │   ├── auth/              # Auth utilities
│   │   ├── db.ts              # Database client
│   │   ├── cache.ts           # Caching
│   │   └── validation.ts      # Zod schemas
│   ├── services/              # Business logic
│   └── test/                  # Test utilities
├── e2e/                       # Playwright tests
├── docs/                      # Documentation
├── public/                    # Static assets
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service worker
└── .github/workflows/         # CI/CD
```

---

## 🔧 Scripts

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint check |
| `npm run test` | Vitest watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Tests with coverage |
| `npm run test:e2e` | Playwright tests |
| `npm run test:all` | All tests |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database |

---

## 🤝 Contributing

### Development Workflow

1. Fork repository
2. Create feature branch (`git checkout -b feature/fitur-baru`)
3. Make changes with tests
4. Run tests (`npm run test:run`)
5. Commit (`git commit -m 'feat: add new feature'`)
6. Push (`git push origin feature/fitur-baru`)
7. Create Pull Request

### Commit Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `test:` Testing
- `refactor:` Code refactoring
- `chore:` Maintenance

### Code Standards

- TypeScript strict mode
- ESLint rules
- Test coverage for new features
- Update documentation

---

## 📄 License

MIT License with Medical Disclaimer. See [LICENSE](LICENSE) for details.

**Medical Disclaimer**: This application is for reference purposes only. Clinical decisions remain the responsibility of healthcare professionals. Always verify information with primary sources and follow institutional protocols.

---

## 📊 Project Status

| Stage | Status | Description |
|-------|--------|-------------|
| Stage 1: Foundation | ✅ Complete | LICENSE, .env.example, testing setup |
| Stage 2: Security | ✅ Complete | NextAuth, RBAC, audit logging |
| Stage 3: Quality | ✅ Complete | 342 tests, E2E, CI/CD |
| Stage 4: Documentation | ✅ Complete | API docs, user guide, developer docs |

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/medref/medref/issues)
- **Email**: support@medref.app

---

**MedRef** - Referensi Klinis di Ujung Jari Anda

*Last updated: March 2026 | Version 1.0.0*