import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coach-X Warm-Up Generator',
  description: 'AI-assisted warm-up builder that explains the logic behind every choice.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
