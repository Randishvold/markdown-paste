'use client';

import { useState } from 'react';

type PasteResult = {
  url: string;
  id: string;
} | null;

export default function HomePage() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PasteResult>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Tambahkan feedback visual jika perlu
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Markdown Pastebin</h1>
          <p className="text-gray-600 mt-2">Create and share beautifully rendered Markdown snippets anonymously.</p>
        </header>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your Markdown here..."
            className="w-full h-80 p-4 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isLoading}
          />
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">Max 100 KB. Plain text or Markdown.</p>
            <button
              type="submit"
              disabled={isLoading || !content.trim()}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Paste'}
            </button>
          </div>
        </form>

        {error && <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}
        
        {result && (
          <div className="mt-6 p-4 bg-green-100 rounded-md shadow-md">
            <h3 className="font-semibold text-green-800">Paste Created!</h3>
            <p className="text-sm text-green-700 mt-1">Share this URL:</p>
            <div className="mt-2 flex items-center bg-white p-2 rounded-md">
              <input
                type="text"
                readOnly
                value={result.url}
                className="flex-grow bg-transparent outline-none font-mono text-sm"
              />
              <button onClick={() => copyToClipboard(result.url)} className="ml-4 px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300">Copy</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
