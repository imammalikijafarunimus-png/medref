export const drugSymptomMappings = [
  // ==================== PAIN ====================
  // Paracetamol
  { symptomId: "symptom-fever", drugId: "drug-paracetamol", priority: 1, isFirstLine: true, notes: "Obat pilihan utama untuk demam" },
  { symptomId: "symptom-headache", drugId: "drug-paracetamol", priority: 1, isFirstLine: true, notes: "Nyeri kepala ringan-sedang" },
  { symptomId: "symptom-toothache", drugId: "drug-paracetamol", priority: 2, isFirstLine: true, notes: "Kombinasi dengan NSAID untuk efek sinergis" },
  { symptomId: "symptom-joint-pain", drugId: "drug-paracetamol", priority: 2, isFirstLine: false, notes: "Untuk osteoarthritis ringan" },

  // Ibuprofen
  { symptomId: "symptom-fever", drugId: "drug-ibuprofen", priority: 1, isFirstLine: true },
  { symptomId: "symptom-headache", drugId: "drug-ibuprofen", priority: 1, isFirstLine: true, notes: "Efektif untuk tension headache dan migrain" },
  { symptomId: "symptom-migraine", drugId: "drug-ibuprofen", priority: 2, isFirstLine: true, notes: "Terapi awal untuk migrain ringan-sedang" },
  { symptomId: "symptom-joint-pain", drugId: "drug-ibuprofen", priority: 1, isFirstLine: true, notes: "Obat pilihan untuk arthritis inflamasi" },
  { symptomId: "symptom-muscle-pain", drugId: "drug-ibuprofen", priority: 1, isFirstLine: true },
  { symptomId: "symptom-toothache", drugId: "drug-ibuprofen", priority: 1, isFirstLine: true },
  { symptomId: "symptom-dysmenorrhea", drugId: "drug-ibuprofen", priority: 1, isFirstLine: true },

  // Diclofenac
  { symptomId: "symptom-joint-pain", drugId: "drug-diclofenac", priority: 1, isFirstLine: true, notes: "Efek antiinflamasi kuat" },
  { symptomId: "symptom-muscle-pain", drugId: "drug-diclofenac", priority: 1, isFirstLine: false },
  { symptomId: "symptom-back-pain", drugId: "drug-diclofenac", priority: 1, isFirstLine: false },
  { symptomId: "symptom-dysmenorrhea", drugId: "drug-diclofenac", priority: 1, isFirstLine: true },

  // Naproxen
  { symptomId: "symptom-migraine", drugId: "drug-naproxen", priority: 2, isFirstLine: false, notes: "Profilaksis dan pengobatan akut" },
  { symptomId: "symptom-joint-pain", drugId: "drug-naproxen", priority: 1, isFirstLine: true, notes: "Durasi kerja panjang" },
  { symptomId: "symptom-dysmenorrhea", drugId: "drug-naproxen", priority: 1, isFirstLine: true },

  // Aspirin
  { symptomId: "symptom-chest-pain", drugId: "drug-aspirin", priority: 1, isFirstLine: true, notes: "Untuk angina dan ACS" },

  // Sumatriptan
  { symptomId: "symptom-migraine", drugId: "drug-sumatriptan", priority: 1, isFirstLine: true, notes: "Obat spesifik untuk migrain akut" },
  { symptomId: "symptom-headache", drugId: "drug-sumatriptan", priority: 3, isFirstLine: false, notes: "Hanya untuk migrain terkonfirmasi" },

  // Tramadol
  { symptomId: "symptom-abdominal-pain", drugId: "drug-tramadol", priority: 3, isFirstLine: false, notes: "Nyeri sedang-berat jika NSAID tidak efektif" },
  { symptomId: "symptom-back-pain", drugId: "drug-tramadol", priority: 2, isFirstLine: false, notes: "Nyeri kronis" },
  { symptomId: "symptom-joint-pain", drugId: "drug-tramadol", priority: 3, isFirstLine: false },

  // ==================== RESPIRATORY ====================
  // Amoxicillin
  { symptomId: "symptom-cough", drugId: "drug-amoxicillin", priority: 2, isFirstLine: false, notes: "Jika infeksi bakteri suspek" },
  { symptomId: "symptom-sore-throat", drugId: "drug-amoxicillin", priority: 2, isFirstLine: false, notes: "Untuk streptococcal pharyngitis" },
  { symptomId: "symptom-uti", drugId: "drug-amoxicillin", priority: 2, isFirstLine: false },

  // Azithromycin
  { symptomId: "symptom-cough", drugId: "drug-azithromycin", priority: 1, isFirstLine: true, notes: "Atypical pneumonia, bronkitis" },
  { symptomId: "symptom-sore-throat", drugId: "drug-azithromycin", priority: 2, isFirstLine: false },
  { symptomId: "symptom-common-cold", drugId: "drug-azithromycin", priority: 3, isFirstLine: false, notes: "Hanya jika infeksi bakteri" },

  // Ceftriaxone
  { symptomId: "symptom-infection", drugId: "drug-ceftriaxone", priority: 1, isFirstLine: true, notes: "Sepsis, pneumonia berat" },
  { symptomId: "symptom-fever", drugId: "drug-ceftriaxone", priority: 2, isFirstLine: false, notes: "Jika infeksi bakteri" },

  // Doxycycline
  { symptomId: "symptom-cough", drugId: "drug-doxycycline", priority: 1, isFirstLine: true, notes: "CAP, COPD exacerbation" },
  { symptomId: "symptom-uti", drugId: "drug-doxycycline", priority: 2, isFirstLine: false },

  // Metronidazole
  { symptomId: "symptom-abdominal-pain", drugId: "drug-metronidazole", priority: 2, isFirstLine: false, notes: "Infeksi anaerob" },
  { symptomId: "symptom-diarrhea", drugId: "drug-metronidazole", priority: 1, isFirstLine: true, notes: "C. difficile colitis" },

  // ==================== GASTROINTESTINAL ====================
  // Metronidazole untuk GI
  { symptomId: "symptom-dyspepsia", drugId: "drug-metronidazole", priority: 3, isFirstLine: false, notes: "H. pylori eradikasi (kombinasi)" },

  // Clindamycin
  { symptomId: "symptom-abdominal-pain", drugId: "drug-clindamycin", priority: 2, isFirstLine: false, notes: "Infeksi anaerob intraabdomen" },

  // ==================== CARDIOVASCULAR ====================
  // Amlodipine
  { symptomId: "symptom-hypertension", drugId: "drug-amlodipine", priority: 1, isFirstLine: true },
  { symptomId: "symptom-chest-pain", drugId: "drug-amlodipine", priority: 2, isFirstLine: true, notes: "Angina stabil" },

  // Lisinopril
  { symptomId: "symptom-hypertension", drugId: "drug-lisinopril", priority: 1, isFirstLine: true },
  { symptomId: "symptom-edema", drugId: "drug-lisinopril", priority: 2, isFirstLine: false, notes: "Gagal jantung" },

  // Metoprolol
  { symptomId: "symptom-hypertension", drugId: "drug-metoprolol", priority: 1, isFirstLine: true },
  { symptomId: "symptom-chest-pain", drugId: "drug-metoprolol", priority: 1, isFirstLine: true, notes: "Angina" },
  { symptomId: "symptom-palpitation", drugId: "drug-metoprolol", priority: 1, isFirstLine: true },
  { symptomId: "symptom-anxiety", drugId: "drug-metoprolol", priority: 2, isFirstLine: false, notes: "Performance anxiety" },

  // Propranolol
  { symptomId: "symptom-migraine", drugId: "drug-propranolol", priority: 1, isFirstLine: true, notes: "Profilaksis migrain" },
  { symptomId: "symptom-anxiety", drugId: "drug-propranolol", priority: 1, isFirstLine: true, notes: "Performance anxiety" },
  { symptomId: "symptom-palpitation", drugId: "drug-propranolol", priority: 2, isFirstLine: false },

  // Furosemide
  { symptomId: "symptom-edema", drugId: "drug-furosemide", priority: 1, isFirstLine: true, notes: "Edema paru, gagal jantung" },

  // Spironolactone
  { symptomId: "symptom-edema", drugId: "drug-spironolactone", priority: 2, isFirstLine: false, notes: "Kombinasi dengan loop diuretic" },

  // Digoxin
  { symptomId: "symptom-palpitation", drugId: "drug-digoxin", priority: 2, isFirstLine: false, notes: "Rate control AF" },

  // Isosorbide dinitrate
  { symptomId: "symptom-chest-pain", drugId: "drug-isosorbide-dinitrate", priority: 1, isFirstLine: true, notes: "Angina prophylaxis" },

  // Simvastatin
  { symptomId: "symptom-diabetes", drugId: "drug-simvastatin", priority: 2, isFirstLine: true, notes: "Risk reduction" },

  // Atorvastatin
  { symptomId: "symptom-diabetes", drugId: "drug-atorvastatin", priority: 1, isFirstLine: true, notes: "High intensity statin" },

  // ==================== NEUROLOGY/PSYCHIATRY ====================
  // Duloxetine (dari analgesics - untuk neuropatik)
  // Amitriptyline bisa ditambahkan

  // ==================== ALLERGY ====================
  // Antibiotik untuk infeksi alergi
  { symptomId: "symptom-allergic-rhinitis", drugId: "drug-azithromycin", priority: 3, isFirstLine: false, notes: "Tidak untuk alergi" },

  // ==================== ENDOCRINE ====================
  // Untuk diabetes notes sudah ada
];