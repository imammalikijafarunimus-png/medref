# MedRef User Guide

## Panduan Pengguna MedRef - Aplikasi Referensi Medis

---

## 1. Pengenalan MedRef

### 1.1 Tentang MedRef

MedRef adalah aplikasi referensi medis komprehensif yang dirancang untuk membantu tenaga kesehatan dalam mengakses informasi obat, herbal, interaksi obat, dan alat kalkulator medis secara cepat dan akurat. Aplikasi ini dapat diakses melalui browser web dan diinstal sebagai Progressive Web App (PWA) di perangkat mobile.

### 1.2 Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 📋 Database Obat | Informasi lengkap obat termasuk dosis, indikasi, kontraindikasi |
| 🌿 Herbal | Data herbal dengan rating keamanan dan interaksi |
| 📝 Catatan Klinis | Referensi dan protokol klinis berbagai spesialis |
| 🔍 Cek Interaksi | Deteksi interaksi obat secara real-time |
| 🧮 Kalkulator Medis | BMI, GFR, dosis pediatrik, infus, dan lainnya |
| 📊 Nilai Lab | Referensi nilai normal pemeriksaan laboratorium |
| ⭐ Favorit | Simpan item untuk akses cepat |
| 🌙 Mode Gelap | Tampilan yang nyaman untuk mata |

---

## 2. Memulai

### 2.1 Mengakses Aplikasi

**Via Browser:**
1. Buka browser web (Chrome, Firefox, Safari, Edge)
2. Kunjungi `https://medref.app`
3. Aplikasi akan otomatis memuat

**Install sebagai Aplikasi (PWA):**
1. Kunjungi website menggunakan Chrome atau Safari
2. Tunggu hingga muncul prompt "Install MedRef" atau
3. Klik menu browser → "Add to Home Screen" / "Install App"
4. Aplikasi akan tersedia di home screen perangkat Anda

### 2.2 Navigasi Utama

#### Desktop
- **Header**: Logo, search bar, theme toggle, login
- **Main Content**: Area konten utama
- **Footer**: Informasi dan tautan

#### Mobile
- **Header**: Logo dan search
- **Bottom Navigation**: 4 tombol akses cepat
  - 🏠 Beranda
  - 💊 Obat
  - 🌿 Herbal
  - 📝 Catatan

---

## 3. Fitur Database Obat

### 3.1 Melihat Daftar Obat

1. Klik "Obat" di navigasi atau akses `/drugs`
2. Daftar obat ditampilkan dengan paginasi
3. Gunakan filter kelas obat jika diperlukan
4. Gunakan search bar untuk mencari obat spesifik

### 3.2 Detail Obat

Klik pada obat untuk melihat informasi lengkap:

**Informasi Dasar:**
- Nama obat dan nama generik
- Nama dagang (brand names)
- Kelas obat
- Cara pemberian (route)
- Kategori kehamilan

**Dosis:**
- Dosis dewasa
- Dosis anak/pediatrik
- Dosis maksimal
- Penyesuaian dosis ginjal/hati

**Indikasi:**
- Indikasi utama
- Kode ICD-10
- Prioritas

**Kontraindikasi:**
- Kontraindikasi absolut dan relatif
- Tingkat keparahan

**Interaksi:**
- Daftar obat yang berinteraksi
- Jenis interaksi (mayor/moderat/minor)
- Mekanisme dan penatalaksanaan

### 3.3 Filter dan Pencarian

**Filter berdasarkan Kelas:**
- Analgesik
- Antibiotik
- Antiviral
- Kardiovaskular
- Dan lainnya

**Pencarian:**
- Ketik nama obat di search bar
- Hasil ditampilkan secara real-time
- Mendukung pencarian fuzzy untuk typo

---

## 4. Fitur Herbal

### 4.1 Database Herbal

1. Akses menu "Herbal"
2. Jelajahi herbal berdasarkan kategori:
   - Pencernaan
   - Pernapasan
   - Kardiovaskular
   - Metabolik
   - Imunitas
   - Dan lainnya

### 4.2 Detail Herbal

**Informasi yang tersedia:**
- Nama lokal dan nama latin
- Bagian tanaman yang digunakan
- Cara preparasi
- Khasiat tradisional
- **Rating Keamanan:**
  - 🟢 Aman - Aman dikonsumsi
  - 🟡 Hati-hati - Perlu konsultasi
  - 🔴 Tidak Aman - Kontraindikasi tertentu
- Interaksi dengan obat
- Efek samping potensial

---

## 5. Cek Interaksi Obat

### 5.1 Menggunakan Fitur Interaksi

1. Akses menu "Interaksi" atau `/interaksi`
2. Ketik atau pilih obat pertama
3. Tambahkan obat kedua, ketiga, dst.
4. Klik "Cek Interaksi"

### 5.2 Interpretasi Hasil

**Tingkat Interaksi:**

| Level | Warna | Arti |
|-------|-------|------|
| Mayor | 🔴 Merah | Interaksi serius, hindari kombinasi |
| Moderat | 🟠 Orange | Interaksi signifikan, perlu monitoring |
| Minor | 🟡 Kuning | Interaksi ringan, biasanya dapat diabaikan |

**Informasi yang ditampilkan:**
- Jenis interaksi
- Efek klinis
- Mekanisme
- Rekomendasi penatalaksanaan

### 5.3 Contoh Penggunaan

```
Obat yang dicek:
- Warfarin
- Amoxicillin
- Omeprazole

Hasil: 
⚠️ Moderat: Warfarin + Amoxicillin
- Peningkatan efek antikoagulan
- Monitor INR lebih ketat
```

---

## 6. Kalkulator Medis

### 6.1 Mengakses Kalkulator

Akses menu "Kalkulator" atau `/kalkulator`

### 6.2 Kalkulator yang Tersedia

#### BMI (Indeks Massa Tubuh)
1. Masukkan berat badan (kg)
2. Masukkan tinggi badan (cm)
3. Hasil BMI dan kategori ditampilkan

| BMI | Kategori |
|-----|----------|
| < 18.5 | Berat badan kurang |
| 18.5 - 24.9 | Normal |
| 25 - 29.9 | Overweight |
| ≥ 30 | Obesitas |

#### GFR (Laju Filtrasi Glomerulus)
1. Masukkan usia
2. Masukkan berat badan
3. Masukkan kadar kreatinin serum
4. Pilih jenis kelamin
5. Hasil GFR dan stadium CKD ditampilkan

| GFR (mL/menit) | Stadium CKD |
|----------------|-------------|
| ≥ 90 | G1 (Normal) |
| 60-89 | G2 (Ringan) |
| 45-59 | G3a (Sedang) |
| 30-44 | G3b (Sedang-Berat) |
| 15-29 | G4 (Berat) |
| < 15 | G5 (Gagal Ginjal) |

#### Dosis Pediatrik
1. Masukkan berat badan anak
2. Pilih obat dari daftar
3. Hasil dosis berdasarkan berat badan
4. Peringatan jika mendekati dosis maksimal

#### Infus
1. Masukkan volume cairan (mL)
2. Masukkan durasi (jam)
3. Masukkan drop factor
4. Hasil: flow rate dan drip rate

#### Konversi Steroid
1. Pilih steroid asal
2. Masukkan dosis
3. Pilih steroid tujuan
4. Hasil dosis ekuivalen

#### Dosis Warfarin
1. Masukkan INR pasien
2. Masukkan target INR
3. Rekomendasi dosis ditampilkan
4. Timing pemeriksaan INR berikutnya

#### Elektrolit
- Sodium Terkoreksi (untuk hiperglikemia)
- Anion Gap dengan interpretasi

---

## 7. Nilai Normal Laboratorium

### 7.1 Mengakses Nilai Lab

Akses menu "Nilai Normal Lab" atau `/lab-values`

### 7.2 Kategori yang Tersedia

- Hematologi
- Kimia Darah
- Lipid
- Elektrolit
- Tiroid
- Koagulasi
- Marker Kardiak
- Marker Infeksi
- Blood Gas
- Fungsi Ginjal
- Urinalisis
- Vitamin

### 7.3 Fitur

- Pencarian nilai lab
- Filter berdasarkan kategori
- Rentang nilai pria/wanita
- Penanda nilai kritis

---

## 8. Fitur Favorit

### 8.1 Menyimpan Favorit

1. Pada halaman detail obat/herbal/catatan
2. Klik ikon ⭐ di pojok kanan atas
3. Item tersimpan di favorit

### 8.2 Mengakses Favorit

1. Klik menu "Favorit" atau akses `/favorites`
2. Tab tersedia: Obat, Herbal, Catatan
3. Klik item untuk langsung mengakses

### 8.3 Menghapus Favorit

1. Buka halaman Favorit
2. Klik ikon 🗑️ pada item
3. Konfirmasi penghapusan

---

## 9. Akun dan Autentikasi

### 9.1 Login

1. Klik tombol "Login" di header
2. Masukkan email dan password
3. Atau login dengan Google/GitHub (jika tersedia)

### 9.2 Registrasi

1. Klik "Daftar" di halaman login
2. Isi form:
   - Email
   - Password (min 8 karakter, huruf besar, huruf kecil, angka)
   - Nama lengkap
   - Profesi/Role
3. Klik "Daftar"

### 9.3 Level Akses

| Role | Akses |
|------|-------|
| Admin | Semua fitur + manajemen user |
| Dokter | Read + Write data medis |
| Apoteker | Read + Write obat dan herbal |
| Perawat | Read semua + kalkulator |
| Mahasiswa | Read terbatas |
| Tamu | Read obat dan herbal |

---

## 10. Mode Gelap

### 10.1 Mengaktifkan Mode Gelap

1. Klik ikon 🌙 di header
2. Tampilan berubah ke mode gelap
3. Preferensi tersimpan otomatis

### 10.2 Manfaat Mode Gelap

- Mengurangi kelelahan mata
- Menghemat baterai (layar OLED)
- Nyaman digunakan di lingkungan gelap

---

## 11. Pencarian Global

### 11.1 Menggunakan Search Bar

1. Ketik kata kunci di search bar header
2. Hasil ditampilkan secara real-time
3. Klik hasil untuk langsung mengakses

### 11.2 Tip Pencarian

- Gunakan nama obat parsial (mis: "para" untuk Paracetamol)
- Pencarian mendukung typo (fuzzy matching)
- Hasil mencakup obat, herbal, dan catatan

---

## 12. Offline Access

### 12.1 Kemampuan Offline

Setelah pertama kali mengakses, beberapa fitur tersedia offline:
- Data obat yang sudah dilihat
- Data herbal yang sudah dilihat
- Kalkulator medis

### 12.2 Sinkronisasi

Saat online kembali:
- Data baru akan disinkronkan
- Cache diperbarui otomatis

---

## 13. Tips dan Best Practices

### 13.1 Penggunaan Efektif

1. **Bookmark**: Simpan halaman yang sering diakses
2. **Favorit**: Gunakan fitur favorit untuk akses cepat
3. **PWA**: Install sebagai aplikasi untuk pengalaman lebih baik
4. **Search**: Manfaatkan search bar untuk navigasi cepat

### 13.2 Keamanan

- Logout jika menggunakan perangkat bersama
- Jangan bagikan kredensial akun
- Perbarui password secara berkala

### 13.3 Troubleshooting

**Data tidak muncul:**
- Periksa koneksi internet
- Refresh halaman
- Clear cache browser

**Login gagal:**
- Periksa email dan password
- Gunakan fitur "Lupa Password"
- Hubungi administrator

**Aplikasi lambat:**
- Periksa koneksi internet
- Clear cache browser
- Update browser ke versi terbaru

---

## 14. Dukungan

### 14.1 Bantuan

- **FAQ**: Tersedia di halaman bantuan
- **Email**: support@medref.app
- **GitHub**: github.com/medref/medref/issues

### 14.2 Feedback

Kami menghargai masukan Anda untuk meningkatkan aplikasi. Kirimkan:
- Laporan bug
- Saran fitur baru
- Masukan umum

---

## 15. Disclaimer

MedRef adalah alat bantu referensi medis. Keputusan klinis tetap menjadi tanggung jawab tenaga kesehatan. Selalu:

- Verifikasi informasi dengan sumber primer
- Konsultasi dengan farmasis atau dokter untuk keputusan klinis
- Ikuti protokol dan panduan institusi Anda
- Informasi dapat berubah, pastikan menggunakan versi terbaru

---

*Dokumentasi terakhir diperbarui: Maret 2026*
*Versi Aplikasi: 1.0.0*