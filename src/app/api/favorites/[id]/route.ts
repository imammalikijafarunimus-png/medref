import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE /api/favorites/[id] - Remove a favorite
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // In production, get userId from session/auth
    const userId = 'default-user';

    const favorite = await db.favorite.findFirst({
      where: { id, userId },
    });

    if (!favorite) {
      return NextResponse.json(
        { error: 'Favorit tidak ditemukan' },
        { status: 404 }
      );
    }

    await db.favorite.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus favorit' },
      { status: 500 }
    );
  }
}

// GET /api/favorites/[id] - Check if item is favorited
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const itemType = url.searchParams.get('itemType');

    // In production, get userId from session/auth
    const userId = 'default-user';

    if (!itemType || !['drug', 'herbal', 'note'].includes(itemType)) {
      return NextResponse.json(
        { error: 'itemType harus "drug", "herbal", atau "note"' },
        { status: 400 }
      );
    }

    // Find favorite by item ID and type
    const favorite = await db.favorite.findFirst({
      where: {
        userId,
        itemType,
        ...(itemType === 'drug' && { drugId: id }),
        ...(itemType === 'herbal' && { herbalId: id }),
        ...(itemType === 'note' && { noteId: id }),
      },
    });

    return NextResponse.json({
      isFavorite: !!favorite,
      favoriteId: favorite?.id || null,
    });
  } catch (error) {
    console.error('Error checking favorite:', error);
    return NextResponse.json(
      { error: 'Gagal mengecek favorit' },
      { status: 500 }
    );
  }
}