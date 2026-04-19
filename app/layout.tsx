import type { Metadata } from 'next';
import { Caveat, Inter } from 'next/font/google';
import './globals.css';

const caveat = Caveat({
  variable: '--font-caveat',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Scrum-tool',
  description: 'Een digitaal scrum-bord dat aanvoelt als een echt bord.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="nl"
      className={`${caveat.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="h-screen flex flex-col overflow-hidden font-sans p-4 gap-4">{children}</body>
    </html>
  );
}
