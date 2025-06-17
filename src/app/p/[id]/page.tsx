import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { processMarkdown } from '@/lib/markdown';
import Link from 'next/link';

type PageProps = {
  params: { id: string };
};

export async function generateStaticParams() {
  const supabase = createSupabaseServerClient();
  const { data: pastes } = await supabase.from('pastes').select('id').limit(10).order('created_at', { ascending: false });
  return pastes?.map(({ id }) => ({ id })) || [];
}

const getPageTitle = (content: string): string => {
  const firstLine = content.split('\n')[0];
  // Cari heading markdown pertama, jika tidak ada, gunakan baris pertama
  const match = firstLine.match(/^#+\s+(.*)/);
  if (match && match[1]) {
    return match[1];
  }
  // Ambil 50 karakter pertama jika tidak ada heading
  return firstLine.trim().substring(0, 50) || 'Untitled Paste';
}

export default async function PastePage({ params }: PageProps) {
  const id = params.id;
  const supabase = createSupabaseServerClient();
  const { data: paste } = await supabase.from('pastes').select('content, created_at').eq('id', id).single();

  if (!paste) {
    notFound();
  }

  const processedHtml = await processMarkdown(paste.content);
  const pageTitle = getPageTitle(paste.content);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const rawApiUrl = `${appUrl}/api/paste/${id}`;

  return (
    <div className="min-h-screen">
      <header className="bg-dark-surface sticky top-0 z-10 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Judul sebagai Header */}
            <h1 className="text-lg font-semibold truncate" title={pageTitle}>
              {pageTitle}
            </h1>
            <div className="flex items-center space-x-2">
              <a href={rawApiUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs font-medium bg-gray-600 rounded-md hover:bg-gray-700 transition">
                View Raw
              </a>
              <Link href="/" className="px-3 py-1.5 text-xs font-medium bg-teal-accent-500 rounded-md hover:bg-teal-accent-600 transition">
                New Paste
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article
          className="prose prose-lg lg:prose-xl max-w-none prose-invert"
          dangerouslySetInnerHTML={{ __html: processedHtml }}
        />
      </main>
    </div>
  );
}