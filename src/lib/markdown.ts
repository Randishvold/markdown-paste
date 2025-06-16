import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
// Impor paket yang benar
import rehypeShiki from '@shikijs/rehype';

export async function processMarkdown(content: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    // Gunakan plugin dengan opsi yang lebih sederhana
    .use(rehypeShiki, {
      // Anda bisa menentukan beberapa tema untuk mode terang dan gelap
      // atau hanya satu tema dengan 'theme: "nama-tema"'
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      }
    })
    .use(rehypeStringify)
    .process(content);

  return String(file);
}