import { NextRequest, NextResponse } from 'next/server';
import { ambilDetailGejala, updateGejala, hapusGejala } from '@/services/symptom-service';

// GET /api/symptoms/[id] - Detail gejala
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const symptom = await ambilDetailGejala(id);

    if (!symptom) {
      return NextResponse.json(
        { success: false, error: 'Gejala tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: symptom,
    });
  } catch (error) {
    console.error('Error ambil detail gejala:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data gejala' },
      { status: 500 }
    );
  }
}

// PUT /api/symptoms/[id] - Update gejala
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const symptom = await updateGejala(id, body);

    return NextResponse.json({
      success: true,
      data: symptom,
      message: 'Gejala berhasil diperbarui',
    });
  } catch (error) {
    console.error('Error update gejala:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui gejala' },
      { status: 500 }
    );
  }
}

// DELETE /api/symptoms/[id] - Hapus gejala
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await hapusGejala(id);

    return NextResponse.json({
      success: true,
      message: 'Gejala berhasil dihapus',
    });
  } catch (error) {
    console.error('Error hapus gejala:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus gejala' },
      { status: 500 }
    );
  }
}