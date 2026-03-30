import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemType = searchParams.get('itemType');
    const userId = session.user.id;

    const favorites = await db.favorite.findMany({
      where: { 
        userId,
        ...(itemType ? { itemType } : {}) 
      },
      include: {
        drug: true,
        herbal: true,
        note: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = favorites.map((fav) => {
      if (fav.itemType === "drug" && fav.drug) {
        return {
          id: fav.drug.id,
          name: fav.drug.name,
          genericName: fav.drug.genericName,
          type: "drug" as const,
          favoriteId: fav.id,
          createdAt: fav.createdAt.toISOString(),
        };
      }
      if (fav.itemType === "herbal" && fav.herbal) {
        return {
          id: fav.herbal.id,
          name: fav.herbal.name,
          type: "herbal" as const,
          favoriteId: fav.id,
          createdAt: fav.createdAt.toISOString(),
        };
      }
      if (fav.itemType === "note" && fav.note) {
        return {
          id: fav.note.id,
          title: fav.note.title,
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { itemId, itemType } = body;

    if (!itemId || !itemType) {
      return NextResponse.json({ error: 'itemId dan itemType diperlukan' }, { status: 400 });
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
    return NextResponse.json({ error: 'Gagal menambah favorit' }, { status: 500 });
  }
}