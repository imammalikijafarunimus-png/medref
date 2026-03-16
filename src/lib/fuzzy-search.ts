/**
 * Utilitas Pencarian Fuzzy
 * Menyediakan algoritma pencocokan fuzzy untuk pengalaman pencarian yang lebih baik
 */

/**
 * Jarak Levenshtein - menghitung jumlah minimum edit
 * yang diperlukan untuk mengubah satu string ke string lain
 */
export function jarakLevenshtein(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // hapus
          dp[i][j - 1],     // tambah
          dp[i - 1][j - 1]  // ganti
        );
      }
    }
  }
  
  return dp[m][n];
}

/**
 * Hitung rasio kemiripan antara dua string (0-1)
 */
export function rasioKemiripan(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  const distance = jarakLevenshtein(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);
  
  return 1 - distance / maxLength;
}

/**
 * Cek apakah string cocok secara fuzzy dengan pola
 * Mengembalikan skor (0-100) atau 0 jika tidak cocok
 */
export function cocokFuzzy(teks: string, pola: string, threshold = 0.3): number {
  const teksLower = teks.toLowerCase();
  const polaLower = pola.toLowerCase();
  
  // Cocok sempurna - skor tertinggi
  if (teksLower === polaLower) return 100;
  
  // Diawali dengan pola - skor tinggi
  if (teksLower.startsWith(polaLower)) return 90;
  
  // Mengandung pola - skor bagus
  if (teksLower.includes(polaLower)) return 75;
  
  // Cek apakah karakter pola muncul berurutan
  let indexPola = 0;
  let cocokBeruntun = 0;
  let maxBeruntun = 0;
  let indexTerakhir = -1;
  
  for (let i = 0; i < teksLower.length && indexPola < polaLower.length; i++) {
    if (teksLower[i] === polaLower[indexPola]) {
      if (indexTerakhir === i - 1) {
        cocokBeruntun++;
        maxBeruntun = Math.max(maxBeruntun, cocokBeruntun);
      } else {
        cocokBeruntun = 1;
      }
      indexTerakhir = i;
      indexPola++;
    }
  }
  
  // Semua karakter pola ditemukan berurutan
  if (indexPola === polaLower.length) {
    const bonusBeruntun = maxBeruntun * 5;
    const rasioPanjang = polaLower.length / teksLower.length;
    return Math.min(70, Math.round(40 + bonusBeruntun + rasioPanjang * 20));
  }
  
  // Pencocokan fuzzy berbasis Levenshtein
  const similarity = rasioKemiripan(teksLower, polaLower);
  
  if (similarity >= threshold) {
    return Math.round(similarity * 60);
  }
  
  // Pencocokan per kata untuk pencarian multi-kata
  const kataTeks = teksLower.split(/\s+/);
  const kataPola = polaLower.split(/\s+/);
  
  if (kataPola.length > 1) {
    let kataCocok = 0;
    for (const kp of kataPola) {
      for (const kt of kataTeks) {
        if (kt.includes(kp) || rasioKemiripan(kt, kp) >= 0.7) {
          kataCocok++;
          break;
        }
      }
    }
    
    if (kataCocok > 0) {
      return Math.round((kataCocok / kataPola.length) * 50);
    }
  }
  
  return 0;
}

/**
 * Hasil pencarian dengan skor fuzzy
 */
export interface HasilPencarianFuzzy<T> {
  item: T;
  skor: number;
  tipeCocok: 'exact' | 'startsWith' | 'contains' | 'fuzzy';
}

/**
 * Pencarian fuzzy melalui array item
 */
export function cariFuzzy<T>(
  items: T[],
  pola: string,
  ambilTeksCari: (item: T) => string[],
  opsi: {
    threshold?: number;
    limit?: number;
    minSkor?: number;
  } = {}
): HasilPencarianFuzzy<T>[] {
  const { threshold = 0.3, limit = 20, minSkor = 20 } = opsi;
  
  const hasil: HasilPencarianFuzzy<T>[] = [];
  
  for (const item of items) {
    const teksCari = ambilTeksCari(item);
    let skorTerbaik = 0;
    let tipeTerbaik: HasilPencarianFuzzy<T>['tipeCocok'] = 'fuzzy';
    
    for (const teks of teksCari) {
      if (!teks) continue;
      
      const teksLower = teks.toLowerCase();
      const polaLower = pola.toLowerCase();
      
      if (teksLower === polaLower) {
        skorTerbaik = 100;
        tipeTerbaik = 'exact';
      } else if (teksLower.startsWith(polaLower)) {
        if (skorTerbaik < 90) {
          skorTerbaik = 90;
          tipeTerbaik = 'startsWith';
        }
      } else if (teksLower.includes(polaLower)) {
        if (skorTerbaik < 75) {
          skorTerbaik = 75;
          tipeTerbaik = 'contains';
        }
      } else {
        const skorFuzzy = cocokFuzzy(teks, pola, threshold);
        if (skorFuzzy > skorTerbaik) {
          skorTerbaik = skorFuzzy;
          tipeTerbaik = 'fuzzy';
        }
      }
    }
    
    if (skorTerbaik >= minSkor) {
      hasil.push({
        item,
        skor: skorTerbaik,
        tipeCocok: tipeTerbaik,
      });
    }
  }
  
  hasil.sort((a, b) => b.skor - a.skor);
  return hasil.slice(0, limit);
}

// Alias untuk kompatibilitas
export const fuzzyMatch = cocokFuzzy;

/**
 * Sorot bagian yang cocok dalam teks
 */
export function sorotCocok(teks: string, pola: string): {
  sebelum: string;
  cocok: string;
  sesudah: string;
}[] {
  if (!pola) return [{ sebelum: '', cocok: teks, sesudah: '' }];
  
  const teksLower = teks.toLowerCase();
  const polaLower = pola.toLowerCase();
  const hasil: { sebelum: string; cocok: string; sesudah: string }[] = [];
  
  let indexTerakhir = 0;
  let index = teksLower.indexOf(polaLower);
  
  while (index !== -1) {
    if (index > indexTerakhir) {
      hasil.push({
        sebelum: teks.slice(indexTerakhir, index),
        cocok: '',
        sesudah: '',
      });
    }
    
    hasil.push({
      sebelum: '',
      cocok: teks.slice(index, index + pola.length),
      sesudah: '',
    });
    
    indexTerakhir = index + pola.length;
    index = teksLower.indexOf(polaLower, indexTerakhir);
  }
  
  if (indexTerakhir < teks.length) {
    hasil.push({
      sebelum: teks.slice(indexTerakhir),
      cocok: '',
      sesudah: '',
    });
  }
  
  return hasil.length > 0 ? hasil : [{ sebelum: '', cocok: teks, sesudah: '' }];
}