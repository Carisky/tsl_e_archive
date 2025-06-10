import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TSL App',
  description: 'i18n demo',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
