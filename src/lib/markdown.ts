import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeShiki from 'rehype-shiki';
import * as shiki from 'shiki';

// Cache instance highlighter agar tidak dibuat berulang kali
let highlighter: shiki.Highlighter | undefined;

export async function processMarkdown(content: string): Promise<string> {
  // Inisialisasi highlighter jika belum ada
  if (!highlighter) {
    highlighter = await shiki.getHighlighter({
      // Muat tema yang kita butuhkan. Anda bisa menambahkan lebih banyak.
      themes: ['github-dark', 'github-light'], 
      // Muat bahasa yang umum digunakan.
      langs: ['javascript', 'typescript', 'python', 'bash', 'json', 'markdown', 'jsx', 'tsx'],
    });
  }

  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    // Gunakan instance highlighter yang sudah kita buat
    .use(rehypeShiki, { highlighter, theme: 'github-dark' })
    .use(rehypeStringify)
    .process(content);

  return String(file);
}
