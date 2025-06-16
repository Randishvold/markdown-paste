import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const MAX_CONTENT_LENGTH = 100 * 1024; // 100 KB

export async function POST(request: Request) {
  try {
    const { content } = (await request.json()) as { content?: string };

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ error: 'Content is required.' }, { status: 400 });
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json({ error: `Content exceeds maximum length of ${MAX_CONTENT_LENGTH} bytes.` }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const id = nanoid(8);

    const { data: newPaste, error } = await supabase
      .from('pastes')
      .insert({ id, content })
      .select()
      .single();

    if (error) {
      console.error('Supabase Insert Error:', error);
      return NextResponse.json({ error: 'Failed to create paste.' }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    
      const newPasteUrl = `${appUrl}/p/${newPaste.id}`;

      fetch(newPasteUrl).catch(err => {
        console.error(`Failed to warm cache for new paste ${newPaste.id}:`, err.message);
      });

      return NextResponse.json({
        id: newPaste.id,
        url: newPasteUrl,
        created_at: newPaste.created_at,
      });
    }

    // Fallback jika NEXT_PUBLIC_APP_URL tidak terdefinisi
    const fallbackUrl = `https://${request.headers.get('host')}/p/${newPaste.id}`;
    return NextResponse.json({
        id: newPaste.id,
        url: fallbackUrl,
        created_at: newPaste.created_at,
        warning: "Cache warming skipped: NEXT_PUBLIC_APP_URL is not set."
    });


  } catch (e) {
    if (e instanceof Error) {
        console.error('API Error:', e.message);
    }
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
  }
}