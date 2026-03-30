import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';

// ✅ Strong typing untuk include relations
type FavoriteWithRelations = Prisma.FavoriteGetPayload<{
  include: {
    drug: true;
    herbal: true;
    note: true;
  };
}>;

// ==========================
// GET FAVORITES
// ==========================
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemType = searchParams.get('itemType') as
      | 'drug'
      | 'herbal'
      | 'note'
      | null;

    const userId = session.user.id;

    // ✅ Typed query result
    const favorites: FavoriteWithRelations[] =
      await db.favorite.findMany({
        where: {
          userId,
          ...(itemType ? { itemType } : {}),
        },
        include: {
          drug: true,
          herbal: true,
          note: true,
        },
        orderBy: { createdAt: "desc" },
      });

    // ✅ Fully typed mapping
    const formatted = favorites
      .map((fav) => {
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
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET FAVORITES ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

// ==========================
// ADD FAVORITE
// ==========================
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    const { itemId, itemType } = body as {
      itemId: string;
      itemType: 'drug' | 'herbal' | 'note';
    };

    if (!itemId || !itemType) {
      return NextResponse.json(
        { error: 'itemId dan itemType diperlukan' },
        { status: 400 }
      );
    }

    // ✅ Optional: prevent duplicate favorites
    const existing = await db.favorite.findFirst({
      where: {
        userId,
        itemType,
        OR: [
          { drugId: itemId },
          { herbalId: itemId },
          { noteId: itemId },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Item sudah ada di favorit' },
        { status: 409 }
      );
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
    console.error("POST FAVORITE ERROR:", error);

    return NextResponse.json(
      { error: 'Gagal menambah favorit' },
      { status: 500 }
    );
  }
}