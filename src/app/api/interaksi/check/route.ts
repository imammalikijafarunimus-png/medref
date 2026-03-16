import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/interaksi/check - Cek interaksi antara 2 obat
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const drugA = searchParams.get('drugA');
    const drugB = searchParams.get('drugB');

    if (!drugA || !drugB) {
      return NextResponse.json(
        { success: false, error: 'Parameter drugA dan drugB diperlukan' },
        { status: 400 }
      );
    }

    const interaction = await db.drugInteraction.findFirst({
      where: {
        OR: [
          { drugId: drugA, interactingDrugId: drugB },
          { drugId: drugB, interactingDrugId: drugA },
        ],
      },
      include: {
        drug: { select: { id: true, name: true } },
        interactingDrug: { select: { id: true, name: true } },
      },
    });

    if (!interaction) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: interaction.id,
        drugA: interaction.drug,
        drugB: interaction.interactingDrug,
        interactionType: interaction.interactionType,
        effect: interaction.effect,
        mechanism: interaction.mechanism,
        management: interaction.management,
      },
    });
  } catch (error) {
    console.error('Error checking interaction:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memeriksa interaksi' },
      { status: 500 }
    );
  }
}