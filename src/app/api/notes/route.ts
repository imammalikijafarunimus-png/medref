import { NextRequest, NextResponse } from 'next/server';
import { ambilDaftarCatatan, buatCatatan } from '@/services/note-service';
import { validasiInput, skemaBuatCatatanKlinis, formatErrorZod } from '@/lib/validation';

// GET /api/notes - Daftar catatan klinis
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const halaman = parseInt(searchParams.get('page') || '1');
    const batas = parseInt(searchParams.get('limit') || '20');
    const kategori = searchParams.get('category') || undefined;
    const cari = searchParams.get('search') || undefined;

    const { data, total } = await ambilDaftarCatatan({
      halaman,
      batas,
      kategori,
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
    console.error('Error ambil catatan:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data catatan' },
      { status: 500 }
    );
  }
}

// POST /api/notes - Buat catatan baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validasi = validasiInput(skemaBuatCatatanKlinis, body);
    if (!validasi.success) {
      return NextResponse.json(
        { success: false, errors: formatErrorZod(validasi.errors) },
        { status: 400 }
      );
    }

    const catatan = await buatCatatan(validasi.data);

    return NextResponse.json({
      success: true,
      data: catatan,
      message: 'Catatan berhasil dibuat',
    });
  } catch (error) {
    console.error('Error buat catatan:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat catatan' },
      { status: 500 }
    );
  }
}