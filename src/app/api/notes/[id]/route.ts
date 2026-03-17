import { NextRequest, NextResponse } from 'next/server';
import { ambilDetailCatatan, updateCatatan, hapusCatatan } from '@/services/note-service';

// GET /api/notes/[id] - Detail catatan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const note = await ambilDetailCatatan(id);

    if (!note) {
      return NextResponse.json(
        { success: false, error: 'Catatan tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: note,
    });
  } catch (error) {
    console.error('Error ambil detail catatan:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data catatan' },
      { status: 500 }
    );
  }
}

// PUT /api/notes/[id] - Update catatan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const note = await updateCatatan(id, body);

    return NextResponse.json({
      success: true,
      data: note,
      message: 'Catatan berhasil diperbarui',
    });
  } catch (error) {
    console.error('Error update catatan:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui catatan' },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/[id] - Hapus catatan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await hapusCatatan(id);

    return NextResponse.json({
      success: true,
      message: 'Catatan berhasil dihapus',
    });
  } catch (error) {
    console.error('Error hapus catatan:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus catatan' },
      { status: 500 }
    );
  }
}