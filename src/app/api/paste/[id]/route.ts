import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type RouteContext = {
  params: { id: string };
};

// Tipe untuk { params } sekarang disimpulkan secara otomatis oleh Next.js
export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = context.params; 

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
    console.error('Error fetching paste by ID:', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}