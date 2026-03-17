export const drugNotes = [
  // ==================== TOXICOLOGY ====================
  {
    id: "note-paracetamol-overdose",
    title: "Parasetamol Overdosis",
    content: `## Parasetamol Overdosis

### Dosis Toksik
- Dewasa: >7.5g (150 mg/kg) sebagai dosis tunggal
- Anak: >150 mg/kg sebagai dosis tunggal
- Dosis kronis: >4g/hari selama beberapa hari

### Manifestasi Klinis
**Fase 1 (0-24 jam):**
- Mual, muntah, anoreksia
- Nyeri perut
- Mungkin asimtomatis

**Fase 2 (24-72 jam):**
- Peningkatan transaminase (AST, ALT)
- RUQ pain
- Koagulopati mulai muncul

**Fase 3 (72-96 jam):**
- Puncak hepatotoksisitas
- Jaundice, koagulopati
- Ensefalopati hepatic
- Gagal hati akut

**Fase 4 (>4 hari):**
- Pulih atau kematian

### Penatalaksanaan
1. **Dekontaminasi:** Activated charcoal dalam 4 jam
2. **Antidotum:** N-asetilsistein (NAC)
   - IV: Loading 150 mg/kg dalam 1 jam, lalu 50 mg/kg dalam 4 jam, lalu 100 mg/kg dalam 16 jam
   - Oral: 140 mg/kg loading, lalu 70 mg/kg setiap 4 jam (17 dosis)
3. **Monitoring:** AST, ALT, bilirubin, INR, creatinine setiap 12-24 jam
4. **Rum nomogram:** Gunakan jika diketahui waktu ingest tunggal

### Kriteria Rujukan ke Transplantasi Hati
- pH <7.3 atau
- INR >6.5 + creatinine >3.4 mg/dL + encephalopathy grade III-IV`,
    category: "toxicology",
    specialty: "emergency",
    tags: "paracetamol,overdose,toxicology,hepatotoxicity,nac",
    author: "MedRef Team",
    version: 1,
  },

  // ==================== CARDIOVASCULAR ====================
  {
    id: "note-af-rate-control",
    title: "Fibrilasi Atrium - Rate Control",
    content: `## Fibrilasi Atrium: Strategi Rate Control

### Target Denyut Jantung
- **Istirahat:** <110 bpm (strategy lenient) atau <80 bpm (strategy strict)
- **Aktivitas:** <110 bpm saat aktivitas sedang

### Obat Pilihan
**1. Beta-blocker (First line)**
- Bisoprolol 2.5-10 mg/hari
- Metoprolol succinate 25-200 mg/hari
- Carvedilol 6.25-25 mg bid

**2. Calcium Channel Blocker (Non-dihydropyridine)**
- Diltiazem ER 120-360 mg/hari
- Verapamil SR 120-360 mg/hari
- *Kontraindikasi pada gagal jantung dengan EF rendah*

**3. Digoxin**
- Dosis 0.125-0.25 mg/hari
- Target kadar 0.5-0.9 ng/mL
- Indikasi: sedentary patient, gagal jantung, intoleransi BB/CCB

**4. Kombinasi**
- BB + digoxin (hati-hati bradikardia)
- CCB + digoxin (hati-hati blok AV)

### Monitoring
- Denyut jantung istirahat dan aktivitas
- EKG untuk blok AV
- Kadar digoxin jika digunakan
- Tanda gagal jantung

### Rate vs Rhythm Control
Rate control lebih disukai jika:
- Usia >65 tahun
- Tidak ada gejala signifikan
- Penyakit jantung struktural
- Hipertensi
- Durasi AF lama

Rhythm control dipertimbangkan jika:
- Usia muda
- Gejala signifikan
- AF baru (<1 tahun)
- Tidak ada penyakit jantung struktural`,
    category: "cardiology",
    specialty: "cardiology",
    tags: "atrial fibrillation,rate control,beta blocker,digoxin,cardiology",
    author: "MedRef Team",
    version: 1,
  },

  {
    id: "note-heart-failure-gdmft",
    title: "Gagal Jantung - GDMFT",
    content: `## Gagal Jantung dengan EF Reduced: GDMFT

### Empat Pilar Terapi (GDMFT)

**G - Guideline-Directed Medical Therapy**
1. **ACEI/ARB/ARNI**
   - Lisinopril 5-40 mg/hari
   - Valsartan 40-160 mg bid
   - Sacubitril/valsartan 24/26 - 97/103 mg bid (ARNI, lebih baik)

2. **Beta-blocker**
   - Bisoprolol 1.25-10 mg/hari
   - Carvedilol 3.125-25 mg bid
   - Metoprolol succinate 12.5-200 mg/hari
   - *Mulai dosis rendah, naikkan setiap 2 minggu*

**D - Diuretic**
   - Furosemide 20-240 mg/hari
   - Spironolactone 12.5-50 mg/hari (jika EF ≤35%)
   - Target euvolemia

**M - Mineralocorticoid Receptor Antagonist (MRA)**
   - Spironolactone 12.5-50 mg/hari
   - Eplerenone 25-50 mg/hari
   - Monitor K+ dan creatinine

**F - Fino-braterapi (SGLT2i)**
   - Dapagliflozin 10 mg/hari
   - Empagliflozin 10 mg/hari
   - Manfaat bahkan tanpa diabetes

**T - Tambahan (jika masih simtomatik)**
   - Ivabradine (jika HR >70, sinus rhythm)
   - Digoxin (simtomatik despite GDMF)
   - Hydralazine + isosorbide dinitrate (pasien Afrika-Amerika)

### Target Dosis
| Obat | Dosis Awal | Dosis Target |
|------|------------|--------------|
| Bisoprolol | 1.25 mg | 10 mg |
| Carvedilol | 3.125 mg bid | 25 mg bid |
| Lisinopril | 2.5-5 mg | 20-40 mg |
| Sac/Val | 24/26 mg bid | 97/103 mg bid |
| Spironolactone | 12.5 mg | 25-50 mg |

### Monitoring
- Tekanan darah, denyut jantung
- K+, creatinine, eGFR (setiap 1-2 minggu saat titrasi)
- Gejala congestive
- Berat badan harian`,
    category: "cardiology",
    specialty: "cardiology",
    tags: "heart failure,gdmft,ace inhibitor,beta blocker,sglt2i",
    author: "MedRef Team",
    version: 1,
  },

  // ==================== INFECTIOUS DISEASE ====================
  {
    id: "note-antibiotic-stewardship",
    title: "Prinsip Antibiotic Stewardship",
    content: `## Prinsip Antibiotic Stewardship

### 5 D Antibiotik
1. **Diagnosis yang tepat**
   - Konfirmasi infeksi bakteri
   - Hindari antibiotik untuk infeksi viral

2. **Drug yang tepat**
   - Spektrum sempit sesuai kuman
   - Pertimbangkan resistensi lokal

3. **Dosis yang tepat**
   - Berdasarkan fungsi ginjal/hati
   - Farmakokinetik/farmakodinamik

4. **Duration yang tepat**
   - Terpendek yang efektif
   - Re-evaluasi setiap 48-72 jam

5. **De-escalation**
   - Narrowing berdasarkan kultur
   - Berhenti jika tidak ada indikasi

### Strategi
**1. Pemeriksaan Mikrobiologi**
- Kultur sebelum antibiotik
- Blood culture minimal 2 set
- Gram stain cepat

**2. Empiric Therapy**
- Berdasarkan lokasi infeksi
- Pertimbangkan faktor risiko resistensi
- Pertimbangkan komorbiditas

**3. Review 48-72 Jam**
- Respons klinis?
- Hasil kultur?
- Dapat di-de-escalate?
- Dapat dihentikan?

### Durasi Terapi yang Direkomendasikan
| Infeksi | Durasi |
|---------|--------|
| Pneumonia komunitas | 5 hari |
| Pielonefritis | 5-7 hari |
| Cystitis tidak komplikasi | 3-5 hari |
| Sepsis | 7-10 hari |
| Endokarditis | 4-6 minggu |

### Biomarker
- **Procalcitonin:** Dapat membantu keputusan berhenti antibiotik
- **CRP:** Serial monitoring untuk respons terapi`,
    category: "infectious",
    specialty: "infectious disease",
    tags: "antibiotic,stewardship,infection,resistance",
    author: "MedRef Team",
    version: 1,
  },

  // ==================== EMERGENCY ====================
  {
    id: "note-anaphylaxis-treatment",
    title: "Anafilaksis - Penatalaksanaan",
    content: `## Anafilaksis: Penatalaksanaan Darurat

### Kriteria Diagnosis (WFO 2020)
Kriteria 1: Onset akut (menit-jam) dengan:
- Keterlibatan kulit/mukosa (urtikaria, angioedema, pruritus, flush)
DAN minimal SATU dari:
- Respirasi: dyspnea, wheeze, stridor, SpO2 <92%
- Kardiovaskular: hipotensi, syncope, incontinence

Kriteria 2: Terpapar allergen kemungkinan, DAN:
- Hipotensi (SBP turun >30% dari baseline)

Kriteria 3: Terpapar allergen已知, DAN:
- Reaksi kulit
- Respirasi
- Kardiovaskular
- GI (mual, muntah, diare, nyeri perut)

### Penatalaksanaan

**1. Adrenalin (EPINEPHRINE) - PERTAMA!**
- IM 0.3-0.5 mg (0.3-0.5 mL 1:1000) di paha lateral
- Anak: 0.01 mg/kg (maks 0.5 mg)
- Ulangi setiap 5-15 menit jika perlu
- Jika syok berat: IV infusion 0.1-0.5 mcg/kg/menit

**2. Posisi**
- Supine dengan kaki elevasi
- Jika sesak: semi-Fowler
- Jika hamil: left lateral tilt

**3. Cairan IV**
- Normal saline atau Ringer's lactate
- Bolus 1-2 L dewasa, 20 mL/kg anak
- Ulangi sesuai respons

**4. Adjuvan (setelah adrenalin stabil)**
- **Antihistamin:** Diphenhydramine 25-50 mg IV/IM
- **Kortikosteroid:** Methylprednisolone 125 mg IV (mencegah biphasic reaction)
- **Bronkodilator:** Salbutamol nebulizer jika bronchospasm

### Monitoring
- Minimal 4-6 jam (biphasic reaction risk)
- Gejala dapat kembali dalam 72 jam

### Discharge Planning
- Auto-injector adrenalin (EpiPen)
- Edukasi penggunaan
- Rujukan alergi
- Medic alert identification`,
    category: "emergency",
    specialty: "emergency",
    tags: "anaphylaxis,emergency,epinephrine,allergy",
    author: "MedRef Team",
    version: 1,
  },

  // ==================== PAIN MANAGEMENT ====================
  {
    id: "note-who-analgesic-ladder",
    title: "Tangga Analgesik WHO",
    content: `## Tangga Analgesik WHO untuk Nyeri Kanker

### Konsep Awal (1986) - 3 Tangga

    Tangga 3: Nyeri Berat
        └── Opioid kuat ± non-opioid ± adjuvan
        
    Tangga 2: Nyeri Sedang
        └── Opioid lemah ± non-opioid ± adjuvan
        
    Tangga 1: Nyeri Ringan
        └── Non-opioid ± adjuvan

### Modifikasi Modern - 2 Tangga
- Tangga 1: Non-opioid ± adjuvan
- Langsung ke opioid kuat untuk nyeri sedang-berat
- Skip opioid lemah (efikasi terbatas)

### Obat per Tangga

**Tangga 1: Non-opioid**
- Parasetamol 500-1000 mg q4-6h (maks 4g/hari)
- Ibuprofen 400-600 mg q6-8h (maks 2400 mg/hari)
- Naproxen 250-500 mg q12h
- Celecoxib 100-200 mg/hari

**Tangga 2: Opioid Lemah**
- Tramadol 50-100 mg q4-6h (maks 400 mg/hari)
- Codeine 15-60 mg q4-6h

**Tangga 3: Opioid Kuat**
- Morfin oral: 5-15 mg q4h (immediate release)
- Morfin ER: 30-120 mg q12h
- Oksikodon: 5-15 mg q4-6h
- Fentanil transdermal: 12-100 mcg/jam q72h

### Adjuvan Analgesik
| Tipe Nyeri | Adjuvan |
|------------|---------|
| Neuropatik | Gabapentin, Pregabalin, Amitriptyline, Duloxetine |
| Tulang | Bisphosphonate, Denosumab, NSAID, Steroid |
| Spasme | Baclofen, Dantrolene |
| Peningkatan tekanan intrakranial | Deksametason |
| Obstruksi/penekanan | Steroid |

### Prinsip Penting
1. **By the mouth** - Pilih rute oral bila memungkinkan
2. **By the clock** - Dosis terjadwal, bukan PRN
3. **By the ladder** - Step up/down sesuai intensitas
4. **For the individual** - Titrasi dosis
5. **With attention to detail** - Monitor dan kelola efek samping

### Breakthrough Pain
- Dosis rescue: 10-20% dari dosis harian
- Gunakan preparat immediate release
- Maksimal 4x sehari`,
    category: "pain",
    specialty: "palliative",
    tags: "pain,analgesic,who ladder,opioid,palliative",
    author: "MedRef Team",
    version: 1,
  },

  // ==================== DIABETES ====================
  {
    id: "note-diabetes-management-t2dm",
    title: "Diabetes Melitus Tipe 2 - Alur Terapi",
    content: `## Diabetes Melitus Tipe 2: Alur Terapi (ADA 2024)

### Target Glikemik
- HbA1c: <7% untuk kebanyakan dewasa
- Lebih ketat (<6.5%) jika dapat dicapai tanpa hipoglikemia
- Lebih longgar (<8%) pada: lansia, komorbiditas, hipoglikemia unawareness

### Alur Terapi Farmakologis

**Langkah 1: Metformin + Lifestyle**
- Metformin 500-2000 mg/hari
- Jika HbA1c >1.5% above target: pertimbangkan kombinasi awal

**Langkah 2: Tambah Obat Kedua**
Pilih berdasarkan komorbiditas:

| Komorbiditas | Obat Pilihan |
|--------------|--------------|
| Penyakit kardiovaskular aterosklerotik | GLP-1 RA atau SGLT2i dengan bukti CV benefit |
| Gagal jantung | SGLT2i |
| Penyakit ginjal kronik | SGLT2i atau GLP-1 RA |
| Obesitas | GLP-1 RA (semaglutide, tirzepatide) |
| Risiko hipoglikemia | GLP-1 RA, SGLT2i, DPP-4i |
| Biaya terbatas | SU, TZD |

**Langkah 3: Tambah Obat Ketiga**
- Kombinasi dari kelas berbeda
- Pertimbangkan efikasi dan profil efek samping

**Langkah 4: Insulin**
- Indikasi: HbA1c >10%, glukosa puasa >300 mg/dL, gejala hiperglikemia berat
- Mulai basal insulin, titrasi ke target
- Tambahkan prandial jika perlu

### Efikasi Obat (Penurunan HbA1c)
| Obat | Penurunan HbA1c |
|------|-----------------|
| Metformin | 1.0-1.5% |
| GLP-1 RA | 1.0-2.0% |
| SGLT2i | 0.5-1.0% |
| DPP-4i | 0.5-0.8% |
| Sulfonylurea | 1.0-1.5% |
| Insulin | Tidak terbatas |

### Monitoring
- HbA1c setiap 3 bulan (belum target)
- HbA1c setiap 6 bulan (sudah target)
- Fungsi ginjal tahunan (eGFR)
- Profil lipid tahunan`,
    category: "endocrine",
    specialty: "endocrine",
    tags: "diabetes,t2dm,metformin,sglt2i,gpl-1,insulin",
    author: "MedRef Team",
    version: 1,
  },
];