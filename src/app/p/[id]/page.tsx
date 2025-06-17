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

// Fungsi helper untuk mendapatkan judul dari konten
const getPageTitle = (content: string): string => {
  const firstLine = content.split('\n')[0].trim();
  const match = firstLine.match(/^#+\s+(.*)/);
  // Jika ditemukan heading markdown di baris pertama, gunakan itu
  if (match && match[1]) {
    return match[1].trim(); // <-- Tambahkan 'return'
  }
  // Jika tidak, gunakan 50 karakter pertama dari baris pertama
  return firstLine.substring(0, 70) || 'Untitled Paste'; // <-- Tambahkan 'return'
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
    <div className="min-h-screen font-sans dark:bg-dark-bg dark:text-dark-text-primary">
      <header className="bg-dark-surface sticky top-0 z-10 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-lg font-semibold truncate text-dark-text-primary" title={pageTitle}>
              {pageTitle}
            </h1>
            <div className="flex items-center space-x-3">
              <a href={rawApiUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 transition-colors">
                View Raw
              </a>
              <Link href="/" className="px-3 py-1.5 text-xs font-medium text-white bg-teal-accent-500 rounded-md hover:bg-teal-accent-600 transition-colors">
                New Paste
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 'prose-invert' adalah kelas dari plugin typography untuk mode gelap */}
        <article
          className="prose prose-lg lg:prose-xl max-w-none prose-invert"
          dangerouslySetInnerHTML={{ __html: processedHtml }}
        />
      </main>
    </div>
  );
}