'use client';

import { useState, useRef, useEffect } from 'react'; // Impor useEffect

// Definisikan tipe untuk data paste yang akan kita fetch
interface Paste {
  id: string;
  content: string;
  created_at: string;
}

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State baru untuk menyimpan daftar paste terbaru
  const [latestPastes, setLatestPastes] = useState<Paste[]>([]);

  // --- PERUBAHAN BARU: FETCH DATA SAAT KOMPONEN DIMUAT ---
  useEffect(() => {
    // Fungsi untuk mengambil data paste terbaru
    const fetchLatestPastes = async () => {
      try {
        const res = await fetch('/api/pastes?limit=10');
        if (!res.ok) {
          throw new Error('Failed to fetch latest pastes');
        }
        const data: Paste[] = await res.json();
        setLatestPastes(data);
      } catch (fetchError) {
        console.error(fetchError);
        // Anda bisa menampilkan error fetch di UI jika mau
      }
    };

    fetchLatestPastes();
  }, []); // Array dependensi kosong berarti ini hanya berjalan sekali saat komponen dimuat

  const handleSubmit = async (e: React.FormEvent) => {
    // ... (fungsi handleSubmit tidak berubah) ...
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
        // Refresh daftar paste terbaru setelah berhasil membuat yang baru
        const updatedPastesRes = await fetch('/api/pastes?limit=10');
        const updatedPastes = await updatedPastesRes.json();
        setLatestPastes(updatedPastes);
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

  // ... (fungsi copyToClipboard, handleUploadClick, handleFileChange tidak berubah) ...
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
const handleUploadClick = () => {
    fileInputRef.current?.click();
};
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
    return;
    }

    const maxSize = 100 * 1024;
    if (file.size > maxSize) {
    setError(`File is too large. Maximum size is ${maxSize / 1024} KB.`);
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
    const fileContent = readEvent.target?.result as string;
    setContent(fileContent);
    setError(null);
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
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800">Markdown Pastebin</h1>
          <p className="text-gray-600 mt-2">Create and share beautifully rendered Markdown snippets anonymously.</p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Kolom Kiri: Form untuk membuat paste */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
                {/* ... (isi form tidak berubah) ... */}
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your Markdown here, or upload a file below."
                    className="w-full h-80 p-4 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={isLoading}
                    />
                    
                    <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".md,.markdown,text/markdown"
                    />

                    <div className="mt-4 flex items-center justify-between">
                    <button
                        type="button"
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
              <div className="mt-6 p-4 bg-green-100 rounded-md shadow-md">
                  {/* ... (blok hasil tidak berubah) ... */}
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
          
          {/* --- PERUBAHAN BARU: Kolom Kanan untuk daftar paste terbaru --- */}
          <aside className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Latest Pastes</h2>
              <ul className="space-y-3">
                {latestPastes.length > 0 ? (
                  latestPastes.map((paste) => (
                    <li key={paste.id} className="border-b border-gray-200 pb-2">
                      <a href={`/p/${paste.id}`} className="block group hover:bg-gray-50 p-2 rounded-md">
                        <p className="text-blue-600 font-medium truncate group-hover:underline">
                          {/* Ambil baris pertama sebagai judul/preview */}
                          {paste.content.split('\n')[0].replace(/^#+\s*/, '') || 'Untitled Paste'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {/* Format tanggal agar lebih mudah dibaca */}
                          {new Date(paste.created_at).toLocaleString()}
                        </p>
                      </a>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 text-sm">No recent pastes.</li>
                )}
              </ul>
            </div>
          </aside>
        </main>

      </div>
    </div>
  );
}