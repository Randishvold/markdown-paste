import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const MAX_CONTENT_LENGTH = 100 * 1024; // 100 KB

export async function POST(request: Request) {
  try {
    const { content } = (await request.json()) as { content?: string };

    // Validasi input
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ error: 'Content is required.' }, { status: 400 });
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json({ error: `Content exceeds maximum length of ${MAX_CONTENT_LENGTH} bytes.` }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const id = nanoid(8); // Generate an 8-character unique ID

    const { data: newPaste, error } = await supabase
      .from('pastes')
      .insert({ id, content })
      .select()
      .single();

    if (error) {
      console.error('Supabase Insert Error:', error);
      return NextResponse.json({ error: 'Failed to create paste.' }, { status: 500 });
    }
    
    // Memicu revalidasi on-demand untuk path halaman baru
    revalidatePath(`/p/${id}`);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get('host')}`;
    const url = `${appUrl}/p/${newPaste.id}`;

    return NextResponse.json({
      id: newPaste.id,
      url: url,
      created_at: newPaste.created_at,
    });

  } catch (e) {
    console.error('API Error:', e);
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
  }
}
