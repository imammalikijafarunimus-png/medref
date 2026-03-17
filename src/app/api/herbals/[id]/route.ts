import { NextRequest, NextResponse } from 'next/server';
import { ambilDetailHerbal, updateHerbal, hapusHerbal } from '@/services/herbal-service';

// GET /api/herbals/[id] - Detail herbal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const herbal = await ambilDetailHerbal(id);

    if (!herbal) {
      return NextResponse.json(
        { success: false, error: 'Herbal tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: herbal,
    });
  } catch (error) {
    console.error('Error ambil detail herbal:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data herbal' },
      { status: 500 }
    );
  }
}

// PUT /api/herbals/[id] - Update herbal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const herbal = await updateHerbal(id, body);

    return NextResponse.json({
      success: true,
      data: herbal,
      message: 'Herbal berhasil diperbarui',
    });
  } catch (error) {
    console.error('Error update herbal:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui herbal' },
      { status: 500 }
    );
  }
}

// DELETE /api/herbals/[id] - Hapus herbal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await hapusHerbal(id);

    return NextResponse.json({
      success: true,
      message: 'Herbal berhasil dihapus',
    });
  } catch (error) {
    console.error('Error hapus herbal:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus herbal' },
      { status: 500 }
    );
  }
}