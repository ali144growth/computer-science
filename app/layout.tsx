import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Omar Al-Shatti | Computer Science Portfolio',
  description:
    'Bilingual computer science student portfolio for Omar Al-Shatti at Gulf University. Coursework, web systems projects, and student work.',
  openGraph: {
    title: 'Omar Al-Shatti | Computer Science Portfolio',
    description:
      'Bilingual computer science student portfolio for Omar Al-Shatti at Gulf University. Coursework, web systems projects, and student work.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Omar Al-Shatti | Computer Science Portfolio',
    description:
      'Bilingual computer science student portfolio for Omar Al-Shatti at Gulf University.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-[#0B1A33] text-[#F2F4F8] antialiased">
        {children}
      </body>
    </html>
  );
}
