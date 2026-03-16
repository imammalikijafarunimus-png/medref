import { NextRequest, NextResponse } from 'next/server';
import { ambilDaftarObat, buatObat, hitungTotalObat } from '@/services/drug-service';
import { validasiInput, skemaBuatObat, formatErrorZod } from '@/lib/validation';

// GET /api/drugs - Ambil daftar obat
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const halaman = parseInt(searchParams.get('page') || '1');
    const batas = parseInt(searchParams.get('limit') || '20');
    const kelas = searchParams.get('class') || undefined;
    const cari = searchParams.get('search') || undefined;

    const { data, total } = await ambilDaftarObat({
      halaman,
      batas,
      kelas,
      cari,
    });

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page: halaman,
        limit: batas,
        total,
        totalPages: Math.ceil(total / batas),
      },
    });
  } catch (error) {
    console.error('Error ambil obat:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data obat' },
      { status: 500 }
    );
  }
}

// POST /api/drugs - Buat obat baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validasi = validasiInput(skemaBuatObat, body);
    if (!validasi.success) {
      return NextResponse.json(
        { success: false, errors: formatErrorZod(validasi.errors) },
        { status: 400 }
      );
    }

    const obat = await buatObat(validasi.data);

    return NextResponse.json({
      success: true,
      data: obat,
      message: 'Obat berhasil dibuat',
    });
  } catch (error) {
    console.error('Error buat obat:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat obat' },
      { status: 500 }
    );
  }
}