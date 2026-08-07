import { GeistSans } from 'geist/font/sans';
import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/common/theme-provider';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  metadataBase: new URL('https://interview-os.vercel.app'),
  title: 'InterviewOS — AI Interview Platform',
  description:
    'An adaptive AI interview agent that conducts realistic technical interviews, tracks strengths and weaknesses, and generates structured feedback.',
  openGraph: {
    title: 'InterviewOS — AI Interview Platform',
    description:
      'An adaptive AI interview agent that conducts realistic technical interviews.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
