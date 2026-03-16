import { NextRequest, NextResponse } from 'next/server';
import { ambilDetailObat, updateObat, hapusObat } from '@/services/drug-service';
import { validasiInput, skemaUpdateObat, formatErrorZod } from '@/lib/validation';

// GET /api/drugs/[id] - Detail obat
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const obat = await ambilDetailObat(id);

    if (!obat) {
      return NextResponse.json(
        { success: false, error: 'Obat tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: obat,
    });
  } catch (error) {
    console.error('Error ambil detail obat:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil detail obat' },
      { status: 500 }
    );
  }
}

// PUT /api/drugs/[id] - Update obat
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validasi = validasiInput(skemaUpdateObat, body);
    if (!validasi.success) {
      return NextResponse.json(
        { success: false, errors: formatErrorZod(validasi.errors) },
        { status: 400 }
      );
    }

    const obat = await updateObat(id, validasi.data);

    return NextResponse.json({
      success: true,
      data: obat,
      message: 'Obat berhasil diupdate',
    });
  } catch (error) {
    console.error('Error update obat:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate obat' },
      { status: 500 }
    );
  }
}

// DELETE /api/drugs/[id] - Hapus obat
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await hapusObat(id);

    return NextResponse.json({
      success: true,
      message: 'Obat berhasil dihapus',
    });
  } catch (error) {
    console.error('Error hapus obat:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus obat' },
      { status: 500 }
    );
  }
}