import { NextRequest, NextResponse } from 'next/server';
import { ambilDaftarGejala, buatGejala } from '@/services/symptom-service';
import { validasiInput, skemaBuatGejala, formatErrorZod } from '@/lib/validation';

// GET /api/symptoms - Daftar gejala
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const halaman = parseInt(searchParams.get('page') || '1');
    const batas = parseInt(searchParams.get('limit') || '20');
    const kategori = searchParams.get('category') || undefined;
    const cari = searchParams.get('search') || undefined;

    const { data, total } = await ambilDaftarGejala({
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
    console.error('Error ambil gejala:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data gejala' },
      { status: 500 }
    );
  }
}

// POST /api/symptoms - Buat gejala baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validasi = validasiInput(skemaBuatGejala, body);
    if (!validasi.success) {
      return NextResponse.json(
        { success: false, errors: formatErrorZod(validasi.errors) },
        { status: 400 }
      );
    }

    const gejala = await buatGejala(validasi.data);

    return NextResponse.json({
      success: true,
      data: gejala,
      message: 'Gejala berhasil dibuat',
    });
  } catch (error) {
    console.error('Error buat gejala:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat gejala' },
      { status: 500 }
    );
  }
}