import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const limitParam = searchParams.get('limit');

  let limit = 10;
  if (limitParam) {
    const parsedLimit = parseInt(limitParam, 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      limit = parsedLimit;
    }
  }

  try {
    const supabase = createSupabaseServerClient();

    const { data: pastes, error } = await supabase
      .from('pastes')
      
      .select('id, created_at, content')
      
      .order('created_at', { ascending: false })
      
      .limit(limit);

    if (error) {
      console.error('Error fetching latest pastes:', error);
      return NextResponse.json({ error: 'Failed to fetch pastes.' }, { status: 500 });
    }

    return NextResponse.json(pastes);

  } catch (e) {
    if (e instanceof Error) {
        console.error('API Error in /api/pastes:', e.message);
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}