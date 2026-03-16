import { NextRequest, NextResponse } from 'next/server';
import { ambilDaftarHerbal, buatHerbal } from '@/services/herbal-service';
import { validasiInput, skemaBuatHerbal, formatErrorZod } from '@/lib/validation';

// GET /api/herbals - Daftar herbal
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const halaman = parseInt(searchParams.get('page') || '1');
    const batas = parseInt(searchParams.get('limit') || '20');
    const cari = searchParams.get('search') || undefined;

    const { data, total } = await ambilDaftarHerbal({
      halaman,
      batas,
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
    console.error('Error ambil herbal:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data herbal' },
      { status: 500 }
    );
  }
}

// POST /api/herbals - Buat herbal baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validasi = validasiInput(skemaBuatHerbal, body);
    if (!validasi.success) {
      return NextResponse.json(
        { success: false, errors: formatErrorZod(validasi.errors) },
        { status: 400 }
      );
    }

    const herbal = await buatHerbal(validasi.data);

    return NextResponse.json({
      success: true,
      data: herbal,
      message: 'Herbal berhasil dibuat',
    });
  } catch (error) {
    console.error('Error buat herbal:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat herbal' },
      { status: 500 }
    );
  }
}