'use client';

import { useState, useRef } from 'react'; // Impor useRef

type PasteResult = {
  url: string;
  id: string;
} | null;

export default function HomePage() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PasteResult>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyButtonText, setCopyButtonText] = useState('Copy');

  // 1. Buat ref untuk input file yang tersembunyi
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    if (!navigator.clipboard) {
      setCopyButtonText('Cannot Copy');
      setTimeout(() => setCopyButtonText('Copy'), 2000);
      console.warn('Clipboard API not available in this insecure context.');
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

  // 2. Buat handler untuk saat tombol "Upload" diklik
  const handleUploadClick = () => {
    // Memicu klik pada input file yang tersembunyi
    fileInputRef.current?.click();
  };

  // 3. Buat handler untuk membaca file yang dipilih
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Validasi ukuran file (100 KB)
    const maxSize = 100 * 1024;
    if (file.size > maxSize) {
      setError(`File is too large. Maximum size is ${maxSize / 1024} KB.`);
      // Reset input file agar pengguna bisa memilih file yang sama lagi jika mau
      e.target.value = '';
      return;
    }

    // Validasi tipe file
    const isMarkdown = file.type === 'text/markdown' || file.name.endsWith('.md') || file.name.endsWith('.markdown');
    if (!isMarkdown) {
        setError('Invalid file type. Please upload a .md or .markdown file.');
        e.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (readEvent) => {
      const fileContent = readEvent.target?.result as string;
      setContent(fileContent);
      setError(null); // Hapus error sebelumnya jika berhasil
    };
    reader.onerror = () => {
        setError('Failed to read the file.');
    }
    reader.readAsText(file);
    e.target.value = '';
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
              placeholder="Paste your Markdown here, or upload a file below."
              className="w-full h-80 p-4 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading}
            />
            
            {/* 4. Tambahkan input file yang tersembunyi */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".md,.markdown,text/markdown"
            />

            <div className="mt-4 flex items-center justify-between">
              {/* Tombol untuk upload file */}
              <button
                type="button" // 'type="button"' penting agar tidak men-submit form
                onClick={handleUploadClick}
                className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 disabled:bg-gray-400"
                disabled={isLoading}
              >
                Upload File
              </button>

              <div className='flex items-center space-x-4'>
                <p className="text-sm text-gray-500">Max 100 KB</p>
                <button
                    type="submit"
                    disabled={isLoading || !content.trim()}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Creating...' : 'Create Paste'}
                </button>
              </div>
            </div>
        </form>

        {error && <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}
        
        {result && (
          // ... (blok hasil tidak berubah) ...
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
              <button onClick={() => copyToClipboard(result.url)} className="ml-4 px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 w-20 text-center">
                {copyButtonText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}