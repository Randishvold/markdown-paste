import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Markdown Pastebin',
  description: 'Free and anonymous Markdown pastebin.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  )
}