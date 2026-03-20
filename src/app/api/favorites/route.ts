import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from "@prisma/client";

type FavoriteItem =
  | {
      id: string;
      name: string;
      genericName: string;
      category: string;
      drugClass: string;
      type: "drug";
      favoriteId: string;
      createdAt: string;
    }
  | {
      id: string;
      name: string;
      latinName: string;
      category: string;
      benefit: string;
      type: "herbal";
      favoriteId: string;
      createdAt: string;
    }
  | {
      id: string;
      title: string;
      category: string;
      specialty: string;
      content: string;
      type: "note";
      favoriteId: string;
      createdAt: string;
    };

export async function GET(request: NextRequest) {
  try {
    const userId = "default-user";

    const favorites = await db.favorite.findMany({
      where: { userId },
      include: {
        drug: true,
        herbal: true,
        note: true,
      },
      orderBy: { createdAt: "desc" },
    });

    type FavoriteWithRelations = typeof favorites[number];

    const formatted = favorites.map((fav: FavoriteWithRelations) => {
      if (fav.itemType === "drug" && fav.drug) {
        return {
          id: fav.drug.id,
          name: fav.drug.name,
          genericName: fav.drug.genericName,
          category: fav.drug.category,
          drugClass: fav.drug.drugClass,
          type: "drug" as const,
          favoriteId: fav.id,
          createdAt: fav.createdAt.toISOString(),
        };
      }

      if (fav.itemType === "herbal" && fav.herbal) {
        return {
          id: fav.herbal.id,
          name: fav.herbal.name,
          latinName: fav.herbal.latinName,
          category: fav.herbal.category,
          benefit: fav.herbal.description,
          type: "herbal" as const,
          favoriteId: fav.id,
          createdAt: fav.createdAt.toISOString(),
        };
      }

      if (fav.itemType === "note" && fav.note) {
        return {
          id: fav.note.id,
          title: fav.note.title,
          category: fav.note.category,
          specialty: fav.note.specialty,
          content: fav.note.content,
          type: "note" as const,
          favoriteId: fav.id,
          createdAt: fav.createdAt.toISOString(),
        };
      }

      return null;
    }).filter(Boolean);

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
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

    // Check for existing favorite to avoid duplicates
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
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });
    }

    // ✅ Verify ownership before deleting
    const existing = await db.favorite.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Favorit tidak ditemukan' },
        { status: 404 }
      );
    }

    await db.favorite.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Gagal menghapus favorit' },
      { status: 500 }
    );
  }
}