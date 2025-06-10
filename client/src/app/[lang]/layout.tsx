import type { Metadata } from 'next';
import '../globals.css';
import NavBar from '@/components/NavBar';
import { AuthProvider } from '@/context/AuthContext';
import ThemeRegistry from '@/components/ThemeRegistry';
import TranslationProvider from '@/components/TranslationProvider';

export const metadata: Metadata = {
  title: 'TSL App',
  description: 'i18n demo',
};

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <ThemeRegistry>
      <AuthProvider>
        <TranslationProvider lang={lang}>
          <NavBar />
          {children}
        </TranslationProvider>
      </AuthProvider>
    </ThemeRegistry>
  );
}
