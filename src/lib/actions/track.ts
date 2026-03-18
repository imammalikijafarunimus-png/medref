'use server';

import { db } from '@/lib/db';

// ─────────────────────────────────────────────────────────────────
// trackSearch
// Dipanggil dari SearchBar setiap kali user submit query.
// Query di-sanitize: trim + lowercase + min 2 karakter.
// ─────────────────────────────────────────────────────────────────

export async function trackSearch(query: string): Promise<void> {
  const clean = query.trim().toLowerCase();
  if (clean.length < 2) return; // abaikan query terlalu pendek

  try {
    await db.searchLog.create({ data: { query: clean } });
  } catch {
    // Fire-and-forget — jangan sampai tracking error merusak UX
  }
}

// ─────────────────────────────────────────────────────────────────
// trackView
// Dipanggil dari halaman detail obat/herbal saat halaman dimuat.
// Increment viewCount sebesar 1.
// ─────────────────────────────────────────────────────────────────

export async function trackView(
  type: 'drug' | 'herbal',
  id: string,
): Promise<void> {
  if (!id) return;

  try {
    if (type === 'drug') {
      await db.drug.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });
    } else {
      await db.herbal.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });
    }
  } catch {
    // Fire-and-forget
  }
}