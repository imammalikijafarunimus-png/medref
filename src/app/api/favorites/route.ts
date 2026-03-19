import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/favorites
export async function GET(request: NextRequest) {
  try {
    const userId = 'default-user';

    const favorites = await db.favorite.findMany({
      where: { userId },
      include: {
        drug: true,
        herbal: true,
        note: true,
      },
    });

    const formatted = favorites.map((fav) => {
      if (fav.itemType === 'drug' && fav.drug) {
        return {
          id: fav.drug.id,
          name: fav.drug.genericName,
          category: fav.drug.drugClass,
          type: 'drug',
          favoriteId: fav.id,
        };
      }

      if (fav.itemType === 'herbal' && fav.herbal) {
        return {
          id: fav.herbal.id,
          name: fav.herbal.latinName,
          category: fav.herbal.category,
          benefit: fav.herbal.description,
          type: 'herbal',
          favoriteId: fav.id,
        };
      }

      if (fav.itemType === 'note' && fav.note) {
        return {
          id: fav.note.id,
          title: fav.note.title,
          category: fav.note.category,
          specialty: fav.note.specialty,
          content: fav.note.content,
          type: 'note',
          favoriteId: fav.id,
        };
      }

      return null;
    });

    return NextResponse.json(formatted.filter(Boolean));
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Gagal memuat favorit' },
      { status: 500 }
    );
  }
}

// POST /api/favorites
export async function POST(request: NextRequest) {
  try {
    const userId = 'default-user';
    const body = await request.json();

    const { itemId, itemType } = body;

    if (!itemId || !itemType) {
      return NextResponse.json(
        { error: 'itemId dan itemType diperlukan' },
        { status: 400 }
      );
    }

    if (!['drug', 'herbal', 'note'].includes(itemType)) {
      return NextResponse.json(
        { error: 'itemType tidak valid' },
        { status: 400 }
      );
    }

    const existing = await db.favorite.findFirst({
     where: {
       userId,
       itemType,
       drugId: itemType === 'drug' ? itemId : null,
       herbalId: itemType === 'herbal' ? itemId : null,
       noteId: itemType === 'note' ? itemId : null,
      },
    });

    if (existing) {
      return NextResponse.json({
        isFavorite: true,
        favoriteId: existing.id,
      });
    }

    const favorite = await db.favorite.create({
     data: {
       userId,
       itemType,
       drugId: itemType === 'drug' ? itemId : null,
       herbalId: itemType === 'herbal' ? itemId : null,
       noteId: itemType === 'note' ? itemId : null,
      },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Gagal menambah favorit' },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const userId = 'default-user';
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID diperlukan' },
        { status: 400 }
      );
    }

    await db.favorite.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Gagal menghapus favorit' },
      { status: 500 }
    );
  }
}