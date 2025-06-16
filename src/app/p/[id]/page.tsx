import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { processMarkdown } from '@/lib/markdown';
import Link from 'next/link';


type PageProps = {
   params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const supabase = createSupabaseServerClient();
  const { data: pastes } = await supabase
    .from('pastes')
    .select('id')
    .limit(10)
    .order('created_at', { ascending: false });

  return pastes?.map(({ id }) => ({ id })) || [];
}


export default async function PastePage({ params }: PageProps) {
   const { id } = await params;

  const supabase = createSupabaseServerClient();

  const { data: paste } = await supabase
    .from('pastes')
    .select('content, created_at')
    .eq('id', id)
    .single();

  if (!paste) {
    notFound();
  }

  const processedHtml = await processMarkdown(paste.content);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const rawApiUrl = `${appUrl}/api/paste/${id}`;

  return (
    <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                <Link href="/" className="text-xl font-bold text-gray-800">
                    Markdown Pastebin
                </Link>
                <div className="flex items-center space-x-2">
                    <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(paste.content)}`} download={`${id}.md`} className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300">
                        Download .md
                    </a>
                    <a href={rawApiUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300">
                        View Raw
                    </a>
                </div>
            </div>
        </nav>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <article
                className="prose prose-lg lg:prose-xl max-w-none"
                dangerouslySetInnerHTML={{ __html: processedHtml }}
            />
        </main>
    </div>
  );
}