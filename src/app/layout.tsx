import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FileProvider } from '@/context/FileContext';
import { SessionProvider } from '@/context/SessionContext';
import { UserProvider } from '@/context/UserContext';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CodeReview AI - Smart Code Analysis',
  description: 'Analyze your code with AI-powered code reviews powered by Google Gemini',
  keywords: 'code review, AI, Gemini, code analysis, static analysis',
  authors: [{ name: 'CodeReview AI' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <UserProvider>
          <SessionProvider>
            <Header />
            <FileProvider>
              <main className="flex-1">
                {children}
              </main>
            </FileProvider>
            <Footer />
            <Toaster position="top-right" />
          </SessionProvider>
        </UserProvider>
      </body>
    </html>
  );
}
