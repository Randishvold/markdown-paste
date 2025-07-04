import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { processMarkdown } from '@/lib/markdown';
import Link from 'next/link';
import CodeBlockEnhancer from '@/components/CodeBlockEnhancer';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const supabase = createSupabaseServerClient();
  const { data: pastes } = await supabase.from('pastes').select('id').limit(10).order('created_at', { ascending: false });
  return pastes?.map(({ id }) => ({ id })) || [];
}

export default async function PastePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();
  const { data: paste } = await supabase.from('pastes').select('content, created_at').eq('id', id).single();

  if (!paste) { notFound(); }

  const processedHtml = await processMarkdown(paste.content);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const rawApiUrl = `${appUrl}/api/paste/${id}`;

  return (
    <div className="min-h-screen font-sans dark:bg-dark-bg dark:text-dark-text-primary">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* PERBAIKAN #4: Kontrol dipindahkan ke sini */}
        <div className="flex justify-end items-center mb-6 pb-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <a href={rawApiUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 transition-colors">
              View Raw
            </a>
            <Link href="/" className="px-3 py-1.5 text-xs font-medium text-white bg-teal-accent-500 rounded-md hover:bg-teal-accent-600 transition-colors">
              New Paste
            </Link>
          </div>
        </div>
        
        <article
          className="prose prose-lg lg:prose-xl max-w-none prose-invert"
          dangerouslySetInnerHTML={{ __html: processedHtml }}
        />
      </main>
      
      <CodeBlockEnhancer />
    </div>
  );
}