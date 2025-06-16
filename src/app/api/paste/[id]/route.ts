import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';


export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { error: "ID parameter is missing in the URL." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const { data: paste, error } = await supabase
      .from('pastes')
      .select('id, content, created_at')
      .eq('id', id)
      .single();

    if (error || !paste) {
      return NextResponse.json({ error: 'Paste not found.' }, { status: 404 });
    }

    return NextResponse.json(paste);
  } catch (e) {
    console.error(`Unhandled error in GET /api/paste/[id]:`, e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}