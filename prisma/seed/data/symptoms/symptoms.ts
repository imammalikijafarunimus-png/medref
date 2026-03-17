export const symptoms = [
  // General
  {
    id: "symptom-fever",
    name: "Demam",
    category: "general",
    description: "Peningkatan suhu tubuh di atas 37.5°C (aksila) atau 38°C (rektal/oral). Respons tubuh terhadap infeksi atau inflamasi.",
  },
  {
    id: "symptom-fatigue",
    name: "Kelelahan",
    category: "general",
    description: "Perasaan lelah, tidak bertenaga, atau kelelahan yang berlebihan yang tidak membaik dengan istirahat.",
  },
  {
    id: "symptom-weight-loss",
    name: "Penurunan Berat Badan",
    category: "general",
    description: "Penurunan berat badan yang tidak disengaja dan signifikan dalam waktu singkat.",
  },

  // Pain
  {
    id: "symptom-headache",
    name: "Sakit Kepala",
    category: "neurology",
    description: "Nyeri atau ketidaknyamanan di area kepala atau leher bagian atas. Dapat berupa tension, migrain, atau cluster headache.",
  },
  {
    id: "symptom-migraine",
    name: "Migrain",
    category: "neurology",
    description: "Sakit kepala berat berdenyut, sering unilateral, disertai mual, muntah, dan sensitivitas terhadap cahaya/suara.",
  },
  {
    id: "symptom-toothache",
    name: "Sakit Gigi",
    category: "dental",
    description: "Nyeri pada gigi atau area sekitarnya, biasanya akibat karies, infeksi, atau trauma.",
  },
  {
    id: "symptom-joint-pain",
    name: "Nyeri Sendi",
    category: "musculoskeletal",
    description: "Nyeri pada satu atau lebih sendi, dapat disebabkan oleh arthritis, cedera, atau inflamasi.",
  },
  {
    id: "symptom-muscle-pain",
    name: "Nyeri Otot",
    category: "musculoskeletal",
    description: "Nyeri pada otot (mialgia), dapat disebabkan oleh ketegangan, cedera, infeksi, atau obat.",
  },
  {
    id: "symptom-back-pain",
    name: "Nyeri Punggung",
    category: "musculoskeletal",
    description: "Nyeri di area punggung bawah atau atas, dapat akut atau kronis.",
  },
  {
    id: "symptom-abdominal-pain",
    name: "Nyeri Perut",
    category: "gastrointestinal",
    description: "Nyeri di area perut, dapat bersifat akut atau kronis, kram atau tajam.",
  },
  {
    id: "symptom-chest-pain",
    name: "Nyeri Dada",
    category: "cardiovascular",
    description: "Nyeri atau ketidaknyamanan di area dada, perlu evaluasi untuk penyebab kardiovaskular dan non-kardiovaskular.",
  },
  {
    id: "symptom-dysmenorrhea",
    name: "Dismenore",
    category: "gynecology",
    description: "Nyeri haid yang kram di area perut bagian bawah, dapat disertai gejala lain.",
  },

  // Respiratory
  {
    id: "symptom-cough",
    name: "Batuk",
    category: "respiratory",
    description: "Refleks ekspirasi paksa untuk membersihkan saluran napas dari iritan atau sekresi.",
  },
  {
    id: "symptom-dry-cough",
    name: "Batuk Kering",
    category: "respiratory",
    description: "Batuk tanpa produksi sputum, sering iritatif dan mengganggu.",
  },
  {
    id: "symptom-productive-cough",
    name: "Batuk Berdahak",
    category: "respiratory",
    description: "Batuk dengan produksi sputum/mukus.",
  },
  {
    id: "symptom-dyspnea",
    name: "Sesak Napas",
    category: "respiratory",
    description: "Kesulitan bernapas atau sensasi napas pendek.",
  },
  {
    id: "symptom-nasal-congestion",
    name: "Hidung Tersumbat",
    category: "respiratory",
    description: "Perasaan hidung tersumbat akibat pembengkakan mukosa nasal.",
  },
  {
    id: "symptom-sore-throat",
    name: "Sakit Tenggorokan",
    category: "respiratory",
    description: "Nyeri atau iritasi di tenggorokan, sering memburuk saat menelan.",
  },
  {
    id: "symptom-runny-nose",
    name: "Hidung Meler",
    category: "respiratory",
    description: "Sekresi berlebihan dari hidung (rinorea).",
  },
  {
    id: "symptom-sneezing",
    name: "Bersin",
    category: "respiratory",
    description: "Refleks ekspirasi paksa melalui hidung, sering akibat iritasi.",
  },

  // Gastrointestinal
  {
    id: "symptom-nausea",
    name: "Mual",
    category: "gastrointestinal",
    description: "Perasaan tidak enak di perut yang sering mendahului muntah.",
  },
  {
    id: "symptom-vomiting",
    name: "Muntah",
    category: "gastrointestinal",
    description: "Pengeluaran isi lambung melalui mulut secara paksa.",
  },
  {
    id: "symptom-diarrhea",
    name: "Diare",
    category: "gastrointestinal",
    description: "Buang air besar dengan feses cair atau setengah padat, frekuensi meningkat (>3x/hari).",
  },
  {
    id: "symptom-constipation",
    name: "Sembelit",
    category: "gastrointestinal",
    description: "Buang air besar jarang atau sulit, feses keras.",
  },
  {
    id: "symptom-dyspepsia",
    name: "Dispepsia",
    category: "gastrointestinal",
    description: "Gangguan pencernaan dengan rasa penuh, kembung, mual, atau nyeri epigastrium.",
  },
  {
    id: "symptom-heartburn",
    name: "Heartburn",
    category: "gastrointestinal",
    description: "Sensasi terbakar di dada akibat refluks asam lambung.",
  },
  {
    id: "symptom-bloating",
    name: "Kembung",
    category: "gastrointestinal",
    description: "Perasaan penuh atau pembesaran perut akibat gas.",
  },
  {
    id: "symptom-ibs",
    name: "IBS (Irritable Bowel Syndrome)",
    category: "gastrointestinal",
    description: "Gangguan fungsional usus dengan nyeri perut dan perubahan kebiasaan buang air besar.",
  },

  // Skin
  {
    id: "symptom-rash",
    name: "Ruam Kulit",
    category: "dermatology",
    description: "Perubahan warna, tekstur, atau penampilan kulit.",
  },
  {
    id: "symptom-itching",
    name: "Gatal",
    category: "dermatology",
    description: "Sensasi gatal yang menyebabkan keinginan menggaruk.",
  },
  {
    id: "symptom-acne",
    name: "Jerawat",
    category: "dermatology",
    description: "Kondisi kulit dengan komedo, papul, pustul, atau nodul pada wajah dan tubuh.",
  },
  {
    id: "symptom-eczema",
    name: "Eksim",
    category: "dermatology",
    description: "Dermatitis dengan kulit kering, gatal, merah, dan dapat melepuh.",
  },

  // Allergy/Immunology
  {
    id: "symptom-allergic-rhinitis",
    name: "Rinitis Alergi",
    category: "allergy",
    description: "Reaksi alergi dengan bersin, hidung meler, gatal, dan hidung tersumbat.",
  },
  {
    id: "symptom-urticaria",
    name: "Biduran (Urtikaria)",
    category: "allergy",
    description: "Reaksi kulit dengan wheal (bengkak) dan flare (kemerahan) yang gatal.",
  },
  {
    id: "symptom-anaphylaxis",
    name: "Anafilaksis",
    category: "allergy",
    description: "Reaksi alergi berat dan mengancam jiwa dengan gangguan pernapasan, kardiovaskular, dan kulit.",
  },

  // Cardiovascular
  {
    id: "symptom-hypertension",
    name: "Hipertensi",
    category: "cardiovascular",
    description: "Tekanan darah tinggi (≥140/90 mmHg), sering tanpa gejala.",
  },
  {
    id: "symptom-palpitation",
    name: "Palpitasi",
    category: "cardiovascular",
    description: "Sensasi detak jantung yang tidak normal, cepat, atau tidak teratur.",
  },
  {
    id: "symptom-edema",
    name: "Edema",
    category: "cardiovascular",
    description: "Pembengkakan akibat penumpukan cairan di jaringan.",
  },

  // Neurology
  {
    id: "symptom-dizziness",
    name: "Pusing",
    category: "neurology",
    description: "Sensasi berputar (vertigo) atau kehilangan keseimbangan.",
  },
  {
    id: "symptom-insomnia",
    name: "Insomnia",
    category: "neurology",
    description: "Kesulitan memulai atau mempertahankan tidur, atau kualitas tidur buruk.",
  },
  {
    id: "symptom-anxiety",
    name: "Kecemasan",
    category: "psychiatry",
    description: "Perasaan cemas, khawatir, atau takut yang berlebihan.",
  },
  {
    id: "symptom-depression",
    name: "Depresi",
    category: "psychiatry",
    description: "Gangguan suasana hati dengan perasaan sedih, kehilangan minat, dan gejala lain.",
  },
  {
    id: "symptom-seizure",
    name: "Kejang",
    category: "neurology",
    description: "Aktivitas listrik abnormal otot yang menyebabkan kontraksi tidak terkendali.",
  },

  // Urology
  {
    id: "symptom-uti",
    name: "Infeksi Saluran Kemih",
    category: "urology",
    description: "Infeksi pada kandung kemih atau saluran kemih dengan disuria, frekuensi, dan urgensi.",
  },
  {
    id: "symptom-dysuria",
    name: "Nyeri Saat Kencing",
    category: "urology",
    description: "Nyeri atau rasa terbakar saat berkemih.",
  },

  // Endocrine
  {
    id: "symptom-diabetes",
    name: "Diabetes",
    category: "endocrine",
    description: "Gangguan metabolik dengan kadar gula darah tinggi.",
  },
  {
    id: "symptom-hypoglycemia",
    name: "Hipoglikemia",
    category: "endocrine",
    description: "Kadar gula darah rendah dengan gejala gemetar, keringat, lapar, dan lemah.",
  },

  // Infectious Disease
  {
    id: "symptom-infection",
    name: "Infeksi",
    category: "infectious",
    description: "Invasi dan perkembangbiakan mikroorganisme patogen dalam tubuh.",
  },
  {
    id: "symptom-flu",
    name: "Flu (Influenza)",
    category: "infectious",
    description: "Infeksi virus influenza dengan demam, myalgia, batuk, dan gejala respirasi.",
  },
  {
    id: "symptom-common-cold",
    name: "Flu Biasa (Common Cold)",
    category: "infectious",
    description: "Infeksi virus ringan pada saluran napas atas dengan hidung meler, batuk, dan bersin.",
  },
];