import { NextRequest, NextResponse } from 'next/server';
import { pencarianGlobal } from '@/services/search-service';

// GET /api/search - Global search with fuzzy matching
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        data: {
          drugs: [],
          herbals: [],
          symptoms: [],
          notes: [],
          totalResults: 0,
          query: '',
        },
      });
    }

    // Use the existing fuzzy search service
    const results = await pencarianGlobal(query, {
      batasPerKategori: limit,
      termasukFuzzy: true,
      skorMinimal: 15,
    });

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal melakukan pencarian' },
      { status: 500 }
    );
  }
}