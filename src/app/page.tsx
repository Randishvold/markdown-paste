'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

// --- Ikon SVG sebagai Komponen React ---
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);
const CreateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

interface Paste {
  id: string;
  content: string;
  created_at: string;
}

type PasteResult = {
  url: string;
  id: string;
} | null;

const LATEST_PASTES_LIMIT = 5;

export default function HomePage() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PasteResult>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyButtonText, setCopyButtonText] = useState('Copy');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [latestPastes, setLatestPastes] = useState<Paste[]>([]);

  const fetchLatestPastes = async () => {
    try {
      const res = await fetch(`/api/pastes?limit=${LATEST_PASTES_LIMIT}`);
      if (!res.ok) throw new Error('Failed to fetch latest pastes');
      const data: Paste[] = await res.json();
      setLatestPastes(data);
    } catch (fetchError) {
      console.error(fetchError);
    }
  };

  useEffect(() => {
    fetchLatestPastes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);
    setCopyButtonText('Copy');
    try {
      const res = await fetch('/api/paste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create paste.');
      }
      const data = await res.json();
      setResult(data);
      setContent('');
      fetchLatestPastes();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    if (!navigator.clipboard) {
      setCopyButtonText('Cannot Copy');
      setTimeout(() => setCopyButtonText('Copy'), 2000);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy'), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopyButtonText('Failed!');
      setTimeout(() => setCopyButtonText('Copy'), 2000);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = 100 * 1024;
    if (file.size > maxSize) {
      setError(`File is too large. Max size is ${maxSize / 1024} KB.`);
      e.target.value = '';
      return;
    }
    const isMarkdown = file.type === 'text/markdown' || file.name.endsWith('.md') || file.name.endsWith('.markdown');
    if (!isMarkdown) {
      setError('Invalid file type. Please upload a .md or .markdown file.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (readEvent) => {
      setContent(readEvent.target?.result as string);
      setError(null);
    };
    reader.onerror = () => setError('Failed to read the file.');
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Markdown Pastebin</h1>
          <p className="mt-3 text-lg text-dark-text-secondary">Create and share beautifully rendered Markdown snippets anonymously.</p>
        </header>

        <main className="flex flex-col lg:flex-row gap-8">
          {/* Kolom Kiri: Form Input */}
          <div className="lg:w-2/3 w-full">
            <form onSubmit={handleSubmit} className="bg-dark-surface rounded-xl shadow-lg p-6">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your Markdown here, or upload a file below."
                className="w-full h-96 p-4 bg-dark-bg border border-gray-700 rounded-lg font-mono text-sm focus:ring-2 focus:ring-teal-accent-500 focus:border-teal-accent-500 transition"
                required
                disabled={isLoading}
              />
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".md,.markdown,text/markdown"/>
              
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={isLoading}
                  className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-800 transition-colors disabled:opacity-50"
                >
                  <UploadIcon />
                  Upload File
                </button>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-dark-text-secondary">Max 100 KB</span>
                  <button
                    type="submit"
                    disabled={isLoading || !content.trim()}
                    className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-teal-accent-500 rounded-lg hover:bg-teal-accent-600 focus:ring-4 focus:outline-none focus:ring-teal-accent-500/50 transition-colors disabled:opacity-50"
                  >
                    <CreateIcon />
                    {isLoading ? 'Creating...' : 'Create Paste'}
                  </button>
                </div>
              </div>
            </form>

            {error && <div className="mt-4 p-4 bg-red-900/50 text-red-300 border border-red-800 rounded-lg">{error}</div>}
            {result && (
              <div className="mt-6 p-4 bg-green-900/50 rounded-lg shadow-lg border border-green-800">
                <h3 className="font-semibold text-green-300">Paste Created!</h3>
                <p className="text-sm text-green-400 mt-1">Share this URL:</p>
                <div className="mt-2 flex items-center bg-dark-bg p-2 rounded-lg">
                  <input type="text" readOnly value={result.url} className="flex-grow bg-transparent outline-none font-mono text-sm"/>
                  <button onClick={() => copyToClipboard(result.url)} className="ml-4 px-4 py-1.5 text-sm bg-gray-600 rounded-md hover:bg-gray-700 w-24 text-center transition">
                    {copyButtonText}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Kolom Kanan: Daftar & Dokumentasi */}
          <aside className="lg:w-1/3 w-full space-y-8">
            <div className="bg-dark-surface rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Latest Pastes</h2>
              <ul className="space-y-2">
                {latestPastes.length > 0 ? (
                  latestPastes.map((paste) => (
                    <li key={paste.id}>
                      <a href={`/p/${paste.id}`} className="block group p-3 rounded-lg hover:bg-dark-bg transition-colors duration-150">
                        <p className="text-sm font-medium text-teal-accent-500 truncate group-hover:underline">
                          {paste.content.split('\n')[0].replace(/^#+\s*/, '').trim() || 'Untitled Paste'}
                        </p>
                        <p className="text-xs text-dark-text-secondary mt-1 font-mono">
                          ID: {paste.id}
                        </p>
                      </a>
                    </li>
                  ))
                ) : (
                  <li className="text-dark-text-secondary text-sm p-3">No recent pastes.</li>
                )}
              </ul>
            </div>
            
            <div className="bg-dark-surface rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Documentation</h2>
              <ul className="space-y-2">
                 <li>
                    <Link href="/p/dummy-link" className="block group p-3 rounded-lg hover:bg-dark-bg transition-colors duration-150">
                      <p className="text-sm font-medium text-teal-accent-500 group-hover:underline">How to use our API</p>
                      <p className="text-xs text-dark-text-secondary mt-1">A quick guide and examples.</p>
                    </Link>
                  </li>
              </ul>
            </div>
          </aside>
        </main>

      </div>
    </div>
  );
}